import { createServerClient } from "@supabase/ssr"
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from "next/server"

export const dynamic = 'force-dynamic' // Desactiva la caché para esta ruta

// Cliente de servicio para operaciones que requieren privilegios elevados
import { createClient } from '@supabase/supabase-js'

function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      },
      global: {
        headers: {
          'Cache-Control': 'no-store'
        }
      },
      db: {
        schema: 'public'
      }
    }
  )
}

// Obtener las cuotas de un socio
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Solicitud GET a /api/admin/socios/[id]/cuotas')
    
    // Obtener el ID del socio de los parámetros de la ruta o de la URL
    let socioId = params?.id;
    
    // Si no está en los parámetros, intentar obtenerlo de la URL
    if (!socioId) {
      const url = new URL(request.url);
      const pathParts = url.pathname.split('/');
      socioId = pathParts[pathParts.indexOf('socios') + 1];
    }
    
    console.log('Parámetros de la ruta:', { params, socioId, url: request.url });

    if (!socioId || socioId === '[id]') {
      console.error('Error: No se proporcionó un ID de socio en los parámetros de la ruta');
      return NextResponse.json(
        { error: 'Se requiere el ID del socio en la URL. Ejemplo: /api/admin/socios/ID_DEL_SOCIO/cuotas' },
        { status: 400 }
      );
    }

    // Verificar que el ID tenga el formato correcto
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(socioId)) {
      console.error('Error: Formato de ID de socio inválido:', socioId);
      return NextResponse.json(
        { error: 'Formato de ID de socio inválido' },
        { status: 400 }
      );
    }
    
    // Crear cliente de servicio para operaciones privilegiadas
    const supabaseClient = createServiceClient();
    
    // Verificar autenticación a través del token de autorización
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Error: No se proporcionó token de autenticación');
      return NextResponse.json(
        { error: 'No autorizado: se requiere autenticación' },
        { status: 401 }
      );
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verificar el token
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Error de autenticación:', authError?.message || 'Usuario no encontrado');
      return NextResponse.json(
        { error: 'No autorizado: token inválido o expirado' },
        { status: 401 }
      );
    }
    
    console.log('Usuario autenticado:', user.email);
    
    // Verificar que el usuario tenga rol de administrador
    const { data: userData, error: userError } = await supabaseClient
      .from('profiles')
      .select('rol')
      .eq('id', user.id)
      .single();
    
    if (userError || !userData) {
      console.error('Error al verificar el perfil del usuario:', userError?.message);
      return NextResponse.json(
        { error: 'Error al verificar los permisos del usuario' },
        { status: 500 }
      );
    }
    
    const allowedRoles = ['super_admin', 'admin_disciplina'];
    if (!userData.rol || !allowedRoles.includes(userData.rol)) {
      console.error('Usuario no autorizado. Rol:', userData.rol);
      return NextResponse.json(
        { error: 'No tienes permisos para acceder a este recurso' },
        { status: 403 }
      );
    }

    // Crear cliente con rol de servicio
    const supabase = createServiceClient()
    
    if (!supabase) {
      console.error('Error: No se pudo crear el cliente de Supabase')
      return NextResponse.json(
        { error: "Error de configuración del servidor" },
        { status: 500 }
      )
    }

    // 1. Obtener solo los datos básicos del grupo familiar
    console.log('Obteniendo datos del grupo familiar con ID:', socioId)
    const { data: grupo, error: grupoError } = await supabase
      .from('grupos_familiares')
      .select('id, nombre, cuota_social, tipo_cuota_id, titular_id')
      .eq('id', socioId)
      .single()

    if (grupoError) {
      console.error('Error al obtener el grupo:', grupoError)
      return NextResponse.json(
        { error: `Error al obtener los datos del grupo familiar: ${grupoError.message}` },
        { status: 500 }
      )
    }

    // 2. Obtener información del titular
    const { data: titular, error: titularError } = await supabase
      .from('profiles')
      .select('full_name, email, dni')
      .eq('id', grupo.titular_id)
      .single()

    if (titularError) {
      console.error('Error al obtener datos del titular:', titularError)
      // Continuar con valores por defecto
    }

    // 3. Obtener el tipo de cuota
    const { data: tipoCuota, error: tipoCuotaError } = await supabase
      .from('cuotas_tipos')
      .select('monto')
      .eq('id', grupo.tipo_cuota_id)
      .single()

    if (tipoCuotaError) {
      console.error('Error al obtener tipo de cuota:', tipoCuotaError)
      // Continuar con valores por defecto
    }

    // 4. Calcular total general (cuota social + monto del tipo de cuota)
    const totalGeneral = (grupo.cuota_social || 0) + (tipoCuota?.monto || 0)

    // 5. Crear respuesta
    const response = {
      grupo: {
        id: grupo.id,
        nombre: grupo.nombre || 'Sin nombre',
        cuota_social: grupo.cuota_social || 0,
        total_general: totalGeneral,
        titular: {
          nombre_completo: titular?.full_name || 'Titular no encontrado',
          email: titular?.email || 'Sin email',
          dni: titular?.dni || 'Sin DNI'
        },
        disciplinas: [] // Por ahora vacío, se puede completar más adelante
      },
      resumen: {
        total_pagado: 0, // Se puede calcular consultando los pagos
        total_pendiente: totalGeneral,
        ultimo_pago: null // Se puede obtener consultando los pagos
      }
    }

    console.log('Respuesta del endpoint /cuotas:', response)
    return NextResponse.json(response)

  } catch (error) {
    console.error('Error en GET /api/admin/socios/[id]/cuotas:', error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServiceClient()
    const socioId = params.id

    if (!socioId) {
      console.error('Error: No se proporcionó un ID de socio')
      return NextResponse.json(
        { error: "Se requiere el ID del socio" },
        { status: 400 }
      )
    }

    const body = await request.json()

    // Validar datos del pago
    if (!body.grupo_id) {
      return NextResponse.json(
        { error: "Se requiere el ID del grupo familiar" },
        { status: 400 }
      )
    }

    if (!body.monto || isNaN(parseFloat(body.monto))) {
      return NextResponse.json(
        { error: "El monto es requerido y debe ser un número válido" },
        { status: 400 }
      )
    }

    if (!body.fecha_pago) {
      return NextResponse.json(
        { error: "La fecha de pago es requerida" },
        { status: 400 }
      )
    }

    // Crear el pago en la base de datos
    const { data: pago, error } = await supabase
      .from("pagos")
      .insert([
        {
          socio_id: socioId,
          grupo_id: body.grupo_id,
          monto: parseFloat(body.monto),
          fecha_pago: body.fecha_pago,
          tipo_pago: body.tipo_pago || 'efectivo',
          referencia: body.referencia || null,
          mes_anio_cuota: body.mes_anio_cuota || new Date().toISOString().split('T')[0].substring(0, 7) + '-01',
          notas: body.notas || null,
        }
      ])
      .select()

    if (error) {
      console.error("Error al crear el pago:", error)
      return NextResponse.json(
        { error: "Error al registrar el pago" },
        { status: 500 }
      )
    }

    return NextResponse.json({ pago: pago?.[0] }, { status: 201 })

  } catch (error) {
    console.error("Error en el servidor:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}