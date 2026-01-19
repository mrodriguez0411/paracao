import { createServiceRoleClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

// --- Helper Functions (modularized for clarity) ---

async function crearUsuario(supabase: any, email: string, password: string, nombre_completo: string) {
  const { data: { user }, error } = await supabase.auth.admin.createUser({
    email,
    password,
    user_metadata: { nombre_completo, rol: "socio" },
    email_confirm: true,
  })
  if (error || !user) throw new Error(`Error al crear usuario: ${error?.message}`)
  return user
}

async function actualizarPerfil(supabase: any, userId: string, telefono: string, dni: string, fecha_nacimiento: string) {
  const { error } = await supabase.from("profiles").update({ dni, fecha_nacimiento, telefono }).eq("id", userId)
  if (error) throw new Error(`Error al actualizar perfil: ${error.message}`)
}

async function crearGrupoFamiliar(supabase: any, nombre_grupo: string, titular_id: string, tipo_cuota_id: string) {
  const { data, error } = await supabase.from("grupos_familiares").insert({ nombre: nombre_grupo, titular_id, tipo_cuota_id }).select("id").single()
  if (error || !data) throw new Error(`Error al crear grupo familiar: ${error.message}`)
  return data.id
}

async function crearMiembrosConInscripciones(supabase: any, grupoId: string, miembros: any[]) {
  if (!miembros || miembros.length === 0) return []

  const miembrosParaInsertar = miembros.map(m => ({
    grupo_id: grupoId,
    nombre_completo: m.nombre_completo,
    dni: m.dni,
    parentesco: m.parentesco || null,
    fecha_nacimiento: m.fecha_nacimiento,
  }))

  const { data: miembrosInsertados, error: miembrosError } = await supabase.from("miembros_familia").insert(miembrosParaInsertar).select("id, nombre_completo")
  if (miembrosError) throw new Error(`Error al crear miembros: ${miembrosError.message}`)

  // Now, handle their inscriptions (actividades)
  const inscripcionesParaCrear = miembros.flatMap((miembroOriginal, index) => {
    const miembroInsertado = miembrosInsertados[index]
    if (!miembroInsertado || !Array.isArray(miembroOriginal.actividades)) return []
    
    return miembroOriginal.actividades.map((actividadId: string) => ({
      miembro_id: miembroInsertado.id,
      actividad_id: actividadId, // Correct column name
    }))
  })

  if (inscripcionesParaCrear.length > 0) {
    const { error: inscError } = await supabase.from("inscripciones").insert(inscripcionesParaCrear)
    if (inscError) console.warn(`[crear-socio] No se pudieron crear algunas inscripciones de miembros:`, inscError.message)
  }
  
  return miembrosInsertados
}

async function crearInscripciones(supabase: any, miembroId: string, actividadIds: string[]) {
  if (!miembroId || !actividadIds || actividadIds.length === 0) return

  const payload = actividadIds.map(actividadId => ({ 
    miembro_id: miembroId, 
    actividad_id: actividadId, // Correct column name
  }))

  const { error } = await supabase.from("inscripciones").insert(payload)
  if (error) console.warn(`[crear-socio] No se pudieron crear inscripciones para el miembro ${miembroId}:`, error.message)
}

// --- Main POST Handler ---

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      email, password, nombre_completo, dni, telefono, 
      nombre_grupo, tipo_cuota_id, fecha_nacimiento, 
      miembros, // Array of member objects
      titular_actividades, // Corrected: Expecting actividad IDs for titular
    } = body

    if (!email || !password || !nombre_completo || !dni || !nombre_grupo || !tipo_cuota_id) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    const supabase = createServiceRoleClient()

    // 1. Create Auth User & Profile
    const user = await crearUsuario(supabase, email, password, nombre_completo)
    await actualizarPerfil(supabase, user.id, telefono, dni, fecha_nacimiento)

    // 2. Create Family Group
    const grupoId = await crearGrupoFamiliar(supabase, nombre_grupo, user.id, tipo_cuota_id)

    // 3. Create Titular as a member_familia record to allow inscriptions
    const { data: titularMiembro, error: titularMiembroError } = await supabase
      .from("miembros_familia")
      .insert({ grupo_id: grupoId, nombre_completo, dni, parentesco: "Titular", socio_id: user.id })
      .select('id').single()
      
    if (titularMiembroError || !titularMiembro) {
        throw new Error(`Error al crear el registro de miembro para el titular: ${titularMiembroError?.message}`)
    }

    // 4. Create inscriptions for the titular
    if (Array.isArray(titular_actividades)) {
        await crearInscripciones(supabase, titularMiembro.id, titular_actividades)
    }

    // 5. Create other family members and their inscriptions
    if (Array.isArray(miembros)) {
        await crearMiembrosConInscripciones(supabase, grupoId, miembros)
    }

    return NextResponse.json({
      success: true,
      user_id: user.id,
    })

  } catch (error: any) {
    console.error("[crear-socio] Error general:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
