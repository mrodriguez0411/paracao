import { createServiceRoleClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nombre_completo, email, rol, password, disciplina_id } = body

    if (!nombre_completo || !email || !rol || !password) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      )
    }

    // If creating an admin for a discipline, disciplina_id is required
    if (rol === 'admin_disciplina' && !disciplina_id) {
      return NextResponse.json(
        { error: 'Falta seleccionar una disciplina' },
        { status: 400 }
      )
    }

    const supabase = createServiceRoleClient()

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      console.error("[admins-create] Error al crear usuario:", authError)
      throw new Error(`Error al crear usuario: ${authError.message}`)
    }

    // Ensure profile exists and has the correct rol (use upsert)
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ id: authData.user.id, nombre_completo, rol }, { onConflict: 'id', returning: 'representation' })
      .select()

    if (error) {
      console.error('[admins-create] Error al crear/actualizar perfil:', error)
      throw new Error(`Error al crear/actualizar perfil: ${error.message}`)
    }

    // If admin de disciplina: create assignment in admin_disciplinas
    let adminDisciplinaRow = null
    if (rol === 'admin_disciplina') {
      // Fetch disciplina name to satisfy NOT NULL constraints
      const { data: disciplinaData, error: disciplinaError } = await supabase
        .from('disciplinas')
        .select('nombre')
        .eq('id', disciplina_id)
        .single()

      if (disciplinaError || !disciplinaData) {
        console.error('[admins-create] Error al obtener disciplina:', disciplinaError)
        throw new Error(`Error al obtener disciplina: ${disciplinaError?.message || 'Disciplina no encontrada'}`)
      }

      // Insert assignment in admin_disciplinas
      const { data: adData, error: adError } = await supabase
        .from('admin_disciplinas')
        .insert({ admin_id: authData.user.id, disciplina_id, nombre: disciplinaData.nombre })
        .select()

      if (adError) {
        console.error('[admins-create] Error al insertar admin_disciplinas:', adError)
        throw new Error(`Error al asignar disciplina: ${adError.message}`)
      }

      adminDisciplinaRow = adData?.[0] || null

      // Also update the disciplinas table to point to this admin
      const { data: dUpdate, error: dUpdateError } = await supabase
        .from('disciplinas')
        .update({ admin_id: authData.user.id })
        .eq('id', disciplina_id)
        .select()

      if (dUpdateError) {
        console.error('[admins-create] Error al actualizar disciplinas.admin_id:', dUpdateError)
        throw new Error(`Error al asignar admin en disciplina: ${dUpdateError.message}`)
      }
    }

    return NextResponse.json({
      success: true,
      data: data?.[0],
      admin_disciplina: adminDisciplinaRow,
    })
  } catch (error) {
    console.error("[admins-create] Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 }
    )
  }
}
