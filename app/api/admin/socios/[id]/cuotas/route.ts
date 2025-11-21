import { createServiceRoleClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

// Obtener las cuotas de un socio
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Solicitud GET a /api/admin/socios/[id]/cuotas')
    const supabase = createServiceRoleClient()
    const socioId = params.id

    if (!socioId) {
      return NextResponse.json(
        { error: "Se requiere el ID del socio" },
        { status: 400 }
      )
    }

    // 1. Obtener solo los datos básicos del grupo familiar
    const { data: grupo, error: grupoError } = await supabase
      .from('grupos_familiares')
      .select('id, nombre, cuota_social, total_general')
      .eq('id', socioId)
      .single()

    if (grupoError) {
      console.error('Error al obtener el grupo:', grupoError)
      return NextResponse.json(
        { error: "Error al obtener los datos del grupo familiar" },
        { status: 500 }
      )
    }

    // 2. Crear una respuesta simple para probar
    const response = {
      grupo: {
        id: grupo.id,
        nombre: grupo.nombre || 'Sin nombre',
        cuota_social: grupo.cuota_social || 0,
        total_general: grupo.total_general || 0,
        // Datos de ejemplo para la cabecera
        titular: {
          nombre_completo: 'Nombre del Titular',
          email: 'ejemplo@email.com',
          dni: '12345678'
        },
        disciplinas: [] // Array vacío por ahora
      },
      resumen: {
        total_pagado: 0,
        total_pendiente: grupo.total_general || 0,
        ultimo_pago: null
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

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceRoleClient()
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