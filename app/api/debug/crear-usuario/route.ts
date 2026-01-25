import { createServiceRoleClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const supabase = createServiceRoleClient()
    
    // Test crear un usuario simple
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'test@example.com',
      password: 'password123',
      user_metadata: { nombre: 'Test', apellido: 'User', rol: 'socio' },
      email_confirm: true,
    })

    console.log('Crear usuario result:', { data, error })

    if (error) {
      return NextResponse.json({ 
        error: error.message,
        details: error
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      user: data.user
    })

  } catch (error) {
    console.error("Debug crear usuario error:", error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
