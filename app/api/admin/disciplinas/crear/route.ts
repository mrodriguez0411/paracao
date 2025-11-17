import { createServiceRoleClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nombre, descripcion, cuota_deportiva, admin_id } = body

    console.log("[disciplinas-create] Creando disciplina:", nombre)

    if (!nombre || cuota_deportiva === undefined) {
      return NextResponse.json(
        { error: "Faltan campos requeridos: nombre y cuota_deportiva" },
        { status: 400 }
      )
    }

    const supabase = createServiceRoleClient()

    const { data, error } = await supabase
      .from("disciplinas")
      .insert({
        nombre: nombre.trim(),
        descripcion: descripcion?.trim() || null,
        cuota_deportiva: Number.parseFloat(cuota_deportiva),
        admin_id: admin_id || null,
        activa: true,
      })
      .select()

    if (error) {
      console.error("[disciplinas-create] Error al crear disciplina:", error)
      throw new Error(`Error al crear disciplina: ${error.message}`)
    }

    console.log("[disciplinas-create] Disciplina creada exitosamente:", data)

    return NextResponse.json({
      success: true,
      data: data?.[0],
    })
  } catch (error) {
    console.error("[disciplinas-create] Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 }
    )
  }
}
