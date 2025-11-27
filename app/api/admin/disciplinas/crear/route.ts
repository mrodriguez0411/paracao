import { createServiceRoleClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: Request) {
  const supabase = createServiceRoleClient()

  try {
    const body = await request.json()
    const {
      nombre,
      descripcion,
      cuota_deportiva,
      admin_id,
    } = body

    if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
      return NextResponse.json({ error: 'El campo "nombre" es requerido.' }, { status: 400 });
    }

    if (typeof cuota_deportiva !== 'number') {
        return NextResponse.json({ error: 'El campo "cuota_deportiva" es requerido y debe ser un número.' }, { status: 400 });
    }

    const disciplina_id = uuidv4()

    // 1. Insert into 'disciplinas' table.
    const { data: disciplinaData, error: disciplinaError } = await supabase
      .from("disciplinas")
      .insert({
        id: disciplina_id,
        nombre: nombre.trim(),
        descripcion: descripcion?.trim() || null,
        cuota_deportiva: cuota_deportiva, // It's already a number
      })
      .select()
      .single();

    if (disciplinaError) {
      throw new Error(`Error al crear la disciplina: ${disciplinaError.message}`)
    }

    // 2. If an admin_id is provided, insert into 'admin_disciplinas' table.
    if (admin_id) {
      const { error: adminError } = await supabase.from("admin_disciplinas").insert({
        disciplina_id: disciplina_id,
        admin_id: admin_id,
        nombre: null,
      })

      if (adminError) {
        throw new Error(`Error al asignar el administrador: ${adminError.message}`)
      }
    }

    return NextResponse.json({
      success: true,
      data: disciplinaData,
    })
  } catch (error) {
    console.error("Server-side error in POST /api/admin/disciplinas/crear:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error desconocido en el servidor" },
      { status: 500 },
    )
  }
}
