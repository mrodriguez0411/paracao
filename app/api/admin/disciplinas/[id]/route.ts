import { createServiceRoleClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id: disciplina_id } = params

    if (!disciplina_id) {
      return NextResponse.json({ error: "Falta el ID de la disciplina" }, { status: 400 })
    }

    const supabase = createServiceRoleClient()

    // 1. Verificar si la disciplina tiene actividades relacionadas
    const { data: actividades, error: actividadesError } = await supabase
      .from("actividades")
      .select("id")
      .eq("disciplina_id", disciplina_id)
      .limit(1)

    if (actividadesError) {
      throw new Error(`Error al verificar actividades: ${actividadesError.message}`)
    }

    if (actividades && actividades.length > 0) {
      return NextResponse.json({ 
        error: "No se puede eliminar la disciplina porque tiene actividades relacionadas. Elimine primero las actividades." 
      }, { status: 400 })
    }

    // 2. Verificar si hay inscripciones relacionadas a través de actividades
    const { data: actividadesIds, error: actividadesIdsError } = await supabase
      .from("actividades")
      .select("id")
      .eq("disciplina_id", disciplina_id)

    if (actividadesIdsError) {
      throw new Error(`Error al obtener IDs de actividades: ${actividadesIdsError.message}`)
    }

    if (actividadesIds && actividadesIds.length > 0) {
      const actividadIdsList = actividadesIds.map(a => a.id)
      
      const { data: inscripciones, error: inscripcionesError } = await supabase
        .from("inscripciones")
        .select("id")
        .in("actividad_id", actividadIdsList)
        .limit(1)

      if (inscripcionesError) {
        throw new Error(`Error al verificar inscripciones: ${inscripcionesError.message}`)
      }

      if (inscripciones && inscripciones.length > 0) {
        return NextResponse.json({ 
          error: "No se puede eliminar la disciplina porque tiene inscripciones relacionadas." 
        }, { status: 400 })
      }
    }

    // 3. Eliminar asignaciones de admin_disciplinas
    const { error: deleteAdminError } = await supabase
      .from("admin_disciplinas")
      .delete()
      .eq("disciplina_id", disciplina_id)

    if (deleteAdminError) {
      throw new Error(`Error al eliminar asignaciones de administrador: ${deleteAdminError.message}`)
    }

    // 4. Eliminar la disciplina
    const { error: deleteError } = await supabase
      .from("disciplinas")
      .delete()
      .eq("id", disciplina_id)

    if (deleteError) {
      throw new Error(`Error al eliminar la disciplina: ${deleteError.message}`)
    }

    return NextResponse.json({
      success: true,
      message: "Disciplina eliminada exitosamente"
    })
      
  } catch (error) {
    console.error("Server-side error in DELETE /api/admin/disciplinas/[id]:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error desconocido en el servidor" },
      { status: 500 },
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await request.json()
    const { nombre, descripcion, admin_id, imagen_url } = body
    const { id: disciplina_id } = params

    if (!disciplina_id) {
      return NextResponse.json({ error: "Falta el ID de la disciplina" }, { status: 400 })
    }

    if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
      return NextResponse.json({ error: 'El campo "nombre" es requerido.' }, { status: 400 });
    }

    const supabase = createServiceRoleClient()

    // 1. Update the disciplina details in 'disciplinas' table
    const { data: disciplinaData, error: disciplinaError } = await supabase
      .from("disciplinas")
      .update({
        nombre: nombre.trim(),
        descripcion: descripcion?.trim() || null,
        imagen_url: imagen_url || null,
        admin_id: admin_id || null,
      })
      .eq("id", disciplina_id)
      .select()
      .single()

    if (disciplinaError) {
      throw new Error(`Error al actualizar la disciplina: ${disciplinaError.message}`)
    }

    // 2. Handle the admin assignment.
    const { error: deleteError } = await supabase
      .from("admin_disciplinas")
      .delete()
      .eq("disciplina_id", disciplina_id)

    if (deleteError) {
      throw new Error(`Error al actualizar la asignación del administrador: ${deleteError.message}`)
    }

    if (admin_id) {
      const { error: insertError } = await supabase
        .from("admin_disciplinas")
        .insert({
          disciplina_id: disciplina_id,
          admin_id: admin_id,
          nombre: disciplinaData?.nombre || null,
        })
        .select()
        .single()

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
