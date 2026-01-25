import { createServiceRoleClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    console.log('=== TEST AUTH ===')
    
    const supabase = createServiceRoleClient()
    
    // 1. Verificar si el service role client funciona
    console.log('1. Service role client creado')
    
    // 2. Probar una consulta simple a la base de datos
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email')
      .limit(1)
    
    console.log('2. Query profiles:', { profiles: profiles?.length, error: profilesError?.message })
    
    if (profilesError) {
      return NextResponse.json({ error: `Error en consulta profiles: ${profilesError.message}` })
    }
    
    // 3. Probar crear usuario con datos de prueba
    const testEmail = `test_${Date.now()}@example.com`
    console.log('3. Intentando crear usuario con email:', testEmail)
    
    const { data, error } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: 'testpassword123',
      user_metadata: { 
        nombre: 'Test', 
        apellido: 'User', 
        rol: 'socio' 
      },
      email_confirm: true,
    })
    
    console.log('4. Resultado createUser:', { 
      userId: data?.user?.id, 
      error: error?.message,
      errorDetails: error
    })
    
    if (error) {
      return NextResponse.json({ 
        error: error.message,
        details: error,
        step: 'createUser'
      }, { status: 500 })
    }
    
    // 4. Si funciona, limpiar el usuario de prueba
    if (data?.user?.id) {
      await supabase.auth.admin.deleteUser(data.user.id)
      console.log('5. Usuario de prueba eliminado')
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Auth service working correctly'
    })
    
  } catch (error) {
    console.error('TEST AUTH ERROR:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      step: 'general'
    }, { status: 500 })
  }
}
