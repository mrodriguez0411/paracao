import { createServiceRoleClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await request.json()
    const { nombre, descripcion, cuota_deportiva, admin_id } = body
    const { id: disciplina_id } = params

    if (!disciplina_id) {
      return NextResponse.json({ error: "Falta el ID de la disciplina" }, { status: 400 })
    }

    if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
      return NextResponse.json({ error: 'El campo "nombre" es requerido.' }, { status: 400 });
    }

    if (typeof cuota_deportiva !== 'number') {
        return NextResponse.json({ error: 'El campo "cuota_deportiva" es requerido y debe ser un número.' }, { status: 400 });
    }

    const supabase = createServiceRoleClient()

    // 1. Update the disciplina details in 'disciplinas' table
    const { data: disciplinaData, error: disciplinaError } = await supabase
      .from("disciplinas")
      .update({
        nombre: nombre.trim(),
        descripcion: descripcion?.trim() || null,
        cuota_deportiva: cuota_deportiva,
      })
      .eq("id", disciplina_id)
      .select()
      .single()

    if (disciplinaError) {
      throw new Error(`Error al actualizar la disciplina: ${disciplinaError.message}`)
    }

    // 2. Handle the admin assignment.
    
    // First, delete any existing record for this disciplina_id.
    const { error: deleteError } = await supabase
      .from("admin_disciplinas")
      .delete()
      .eq("disciplina_id", disciplina_id)

    if (deleteError) {
      throw new Error(`Error al actualizar la asignación del administrador: ${deleteError.message}`)
    }

    // If an admin_id is provided, insert the new association.
    if (admin_id) {
      const { error: insertError } = await supabase
        .from("admin_disciplinas")
        .insert({
          disciplina_id: disciplina_id,
          admin_id: admin_id,
          nombre: null,
        })

      if (insertError) {
        throw new Error(`Error al asignar el nuevo administrador: ${insertError.message}`)
      }
    }

    return NextResponse.json({
      success: true,
      data: disciplinaData,
    })
      
  } catch (error) {
    console.error("Server-side error in PUT /api/admin/disciplinas/[id]:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error desconocido en el servidor" },
      { status: 500 },
    )
  }
}
