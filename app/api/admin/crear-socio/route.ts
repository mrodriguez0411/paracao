import { createServiceRoleClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

async function crearUsuario(supabase: any, email: string, password: string, nombre_completo: string) {
  console.log("[crear-socio] Creando usuario en auth...")
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    user_metadata: {
      nombre_completo,
      rol: "socio",
    },
    email_confirm: true,
  })

  if (authError) {
    console.error("[crear-socio] Error al crear usuario:", authError)
    throw new Error(`Error al crear usuario: ${authError.message}`)
  }

  if (!authData.user) {
    throw new Error("No se pudo crear el usuario")
  }

  return authData.user
}

async function actualizarPerfil(supabase: any, userId: string, telefono: string, dni: string) {
  console.log("[crear-socio] Actualizando perfil...")
  const updateData: any = { dni }
  if (telefono) {
    updateData.telefono = telefono
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", userId)

  if (profileError) {
    console.error("[crear-socio] Error al actualizar perfil:", profileError)
    throw new Error(`Error al actualizar perfil: ${profileError.message}`)
  }
}

async function crearGrupoFamiliar(supabase: any, nombre_grupo: string, titular_id: string, cuota_social: string) {
  console.log("[crear-socio] Creando grupo familiar...")
  const { data: grupoData, error: grupoError } = await supabase
    .from("grupos_familiares")
    .insert({
      nombre: nombre_grupo,
      titular_id,
      cuota_social: Number.parseFloat(cuota_social),
    })
    .select()

  if (grupoError) {
    console.error("[crear-socio] Error al crear grupo:", grupoError)
    throw new Error(`Error al crear grupo familiar: ${grupoError.message}`)
  }

  return grupoData?.[0]?.id
}

async function crearMiembrosFamiliares(supabase: any, grupoId: string, miembros: any[]) {
  if (!miembros || miembros.length === 0) {
    return
  }

  console.log(`[crear-socio] Creando ${miembros.length} miembros familiares...`)

  const miembrosData = miembros.map((miembro: any) => ({
    grupo_id: grupoId,
    nombre_completo: miembro.nombre_completo,
    dni: miembro.dni,
  }))

  const { error: miembrosError } = await supabase
    .from("miembros_familia")
    .insert(miembrosData)

  if (miembrosError) {
    console.error("[crear-socio] Error al crear miembros familiares:", miembrosError)
    throw new Error(`Error al crear miembros familiares: ${miembrosError.message}`)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, nombre_completo, dni, telefono, nombre_grupo, cuota_social, miembros } = body

    console.log("[crear-socio] Iniciando con datos:", { email, nombre_completo, dni, nombre_grupo, miembros })

    // Validar campos requeridos
    if (!email || !password || !nombre_completo || !dni || !nombre_grupo || !cuota_social) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      )
    }

    const supabase = createServiceRoleClient()

    // Crear usuario
    const user = await crearUsuario(supabase, email, password, nombre_completo)
    console.log("[crear-socio] Usuario creado:", user.id)

    // Actualizar perfil
    await actualizarPerfil(supabase, user.id, telefono, dni)

    // Crear grupo familiar
    const grupoId = await crearGrupoFamiliar(supabase, nombre_grupo, user.id, cuota_social)
    console.log("[crear-socio] Grupo creado exitosamente")

    // Crear miembros familiares
    await crearMiembrosFamiliares(supabase, grupoId, miembros)

    return NextResponse.json({
      success: true,
      user_id: user.id,
      email: user.email,
    })
  } catch (error) {
    console.error("[crear-socio] Error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    )
  }
}
