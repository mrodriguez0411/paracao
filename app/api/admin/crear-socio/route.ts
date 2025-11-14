import { createServiceRoleClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, nombre_completo, telefono, nombre_grupo, cuota_social } = body

    console.log("[crear-socio] Iniciando con datos:", { email, nombre_completo, nombre_grupo })

    // Validar campos requeridos
    if (!email || !password || !nombre_completo || !nombre_grupo || !cuota_social) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      )
    }

    const supabase = createServiceRoleClient()

    // Crear usuario usando service-role (evita restricciones de dominio)
    console.log("[crear-socio] Creando usuario en auth...")
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        nombre_completo,
        rol: "socio",
      },
      email_confirm: true, // Auto-confirmar email
    })

    if (authError) {
      console.error("[crear-socio] Error al crear usuario:", authError)
      throw new Error(`Error al crear usuario: ${authError.message}`)
    }

    if (!authData.user) {
      throw new Error("No se pudo crear el usuario")
    }

    console.log("[crear-socio] Usuario creado:", authData.user.id)

    // Actualizar perfil con teléfono
    if (telefono) {
      console.log("[crear-socio] Actualizando perfil con teléfono...")
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ telefono })
        .eq("id", authData.user.id)
      
      if (profileError) {
        console.error("[crear-socio] Error al actualizar perfil:", profileError)
      }
    }

    // Crear grupo familiar
    console.log("[crear-socio] Creando grupo familiar...")
    const { error: grupoError } = await supabase
      .from("grupos_familiares")
      .insert({
        nombre: nombre_grupo,
        titular_id: authData.user.id,
        cuota_social: Number.parseFloat(cuota_social),
      })

    if (grupoError) {
      console.error("[crear-socio] Error al crear grupo:", grupoError)
      throw new Error(`Error al crear grupo familiar: ${grupoError.message}`)
    }

    console.log("[crear-socio] Grupo creado exitosamente")

    return NextResponse.json({
      success: true,
      user_id: authData.user.id,
      email: authData.user.email,
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
