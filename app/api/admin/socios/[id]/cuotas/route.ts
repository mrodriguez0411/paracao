import { NextRequest, NextResponse } from "next/server"
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      }
    }
  )
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const url = new URL(request.url)
    const socioId = url.pathname.split('/')[4]

    if (!socioId || socioId === '[id]') {
      return NextResponse.json({ error: 'Se requiere el ID del socio' }, { status: 400 });
    }

    const supabase = createServiceClient()
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No autorizado: se requiere autenticación' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado: token inválido o expirado' }, { status: 401 });
    }
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('rol')
      .eq('id', user.id)
      .single();
    if (userError || !userData) {
      return NextResponse.json({ error: 'Error al verificar los permisos del usuario' }, { status: 500 });
    }
    const allowedRoles = ['super_admin', 'admin_disciplina'];
    if (!userData.rol || !allowedRoles.includes(userData.rol)) {
      return NextResponse.json({ error: 'No tienes permisos para acceder a este recurso' }, { status: 403 });
    }

    const { data: grupo, error: grupoError } = await supabase
      .from('grupos_familiares')
      .select(`
        id,
        nombre,
        cuota_social,
        tipo_cuota_id,
        titular:titular_id (
            nombre_completo,
            email,
            dni
        ),
        miembros_familia (
          id,
          socio_id,
          profiles (
            nombre_completo
          )
        )
      `)
      .eq('id', socioId)
      .single();

    if (grupoError) {
      console.error('Error al obtener el grupo familiar:', grupoError);
      return NextResponse.json({ error: `Error al obtener los datos del grupo familiar: ${grupoError.message}` }, { status: 500 });
    }

    if (!grupo) {
        return NextResponse.json({ error: 'No se encontró el grupo familiar' }, { status: 404 });
    }

    const { data: tipoCuota, error: tipoCuotaError } = await supabase
      .from('cuotas_tipos')
      .select('id, nombre, cuota')
      .eq('id', grupo.tipo_cuota_id)
      .single();

    if (tipoCuotaError) {
      console.warn('Advertencia al obtener tipo de cuota:', tipoCuotaError.message);
    }

    const miembroIds = grupo.miembros_familia.map(m => m.id);
    let disciplinas = [];
    let totalCuotaDeportiva = 0;

    if (miembroIds.length > 0) {
        const { data: inscripcionesData, error: inscripcionesError } = await supabase
            .from('inscripciones')
            .select('miembro_id, disciplina_id')
            .in('miembro_id', miembroIds);

        if (inscripcionesError) {
            console.error('Error al obtener las inscripciones:', inscripcionesError);
            return NextResponse.json({ error: `Error al obtener las inscripciones: ${inscripcionesError.message}` }, { status: 500 });
        }

        if (inscripcionesData && inscripcionesData.length > 0) {
            const disciplinaIds = [...new Set(inscripcionesData.map(i => i.disciplina_id))];

            const { data: disciplinasDetails, error: disciplinasError } = await supabase
                .from('disciplinas')
                .select('id, nombre, cuota_deportiva')
                .in('id', disciplinaIds);

            if (disciplinasError) {
                console.error('Error al obtener los detalles de las disciplinas:', disciplinasError);
                return NextResponse.json({ error: `Error al obtener los detalles de las disciplinas: ${disciplinasError.message}` }, { status: 500 });
            }

            if (disciplinasDetails) {
              disciplinas = inscripcionesData.map(inscripcion => {
                  const disciplinaDetail = disciplinasDetails.find(d => d.id === inscripcion.disciplina_id);
                  const miembro = grupo.miembros_familia.find(m => m.id === inscripcion.miembro_id);
                  const monto = disciplinaDetail?.cuota_deportiva || 0;
                  totalCuotaDeportiva += monto;
                  return {
                      id: disciplinaDetail?.id,
                      nombre: disciplinaDetail?.nombre,
                      monto: monto,
                      miembro_nombre: miembro?.profiles?.nombre_completo || 'Miembro no encontrado'
                  };
              }).filter(d => d.id);
            }
        }
    }

    const totalGeneral = (grupo.cuota_social || 0) + (tipoCuota?.cuota || 0) + totalCuotaDeportiva;

    const safeTitular = grupo.titular ? grupo.titular : { nombre_completo: 'Titular no disponible', email: 'N/A', dni: 'N/A' };

    const response = {
      grupo: {
        id: grupo.id,
        nombre: grupo.nombre || 'Sin nombre',
        cuota_social: grupo.cuota_social || 0,
        total_cuota_deportiva: totalCuotaDeportiva,
        total_general: totalGeneral,
        titular: safeTitular,
        disciplinas: disciplinas,
        tipo_cuota: tipoCuota ? { ...tipoCuota, monto: tipoCuota.cuota } : null
      },
      resumen: { 
        total_pagado: 0,
        total_pendiente: totalGeneral,
        ultimo_pago: null
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    const err = error as Error;
    console.error('Error inesperado en GET /api/admin/socios/[id]/cuotas:', err.message);
    return NextResponse.json({ error: "Error interno del servidor", details: err.message }, { status: 500 });
  }
}
