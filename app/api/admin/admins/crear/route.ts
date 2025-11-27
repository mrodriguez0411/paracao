import { createServiceRoleClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nombre_completo, email, rol, password } = body

    if (!nombre_completo || !email || !rol || !password) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
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

    const { data, error } = await supabase
      .from("profiles")
      .update({
        nombre_completo,
        rol,
      })
      .eq("id", authData.user.id)
      .select()

    if (error) {
      console.error("[admins-create] Error al crear perfil:", error)
      throw new Error(`Error al crear perfil: ${error.message}`)
    }

    return NextResponse.json({
      success: true,
      data: data?.[0],
    })
  } catch (error) {
    console.error("[admins-create] Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 }
    )
  }
}
