import { createServiceRoleClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log('=== VERIFY SERVICE KEY ===')
    
    // Verificar variables de entorno
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    console.log('Environment check:', {
      url: url ? 'Presente' : 'Faltante',
      urlLength: url?.length,
      serviceKey: serviceKey ? 'Presente' : 'Faltante',
      serviceKeyLength: serviceKey?.length,
      serviceKeyStart: serviceKey?.substring(0, 20) + '...',
    })
    
    if (!url || !serviceKey) {
      return NextResponse.json({ 
        error: 'Faltan variables de entorno',
        url: !!url,
        serviceKey: !!serviceKey
      }, { status: 500 })
    }
    
    const supabase = createServiceRoleClient()
    
    // Probar consulta simple
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    console.log('Query test:', { profiles, error: profilesError?.message })
    
    if (profilesError) {
      return NextResponse.json({ 
        error: 'Error en consulta a profiles',
        details: profilesError.message
      }, { status: 500 })
    }
    
    // Probar crear usuario de prueba
    const testEmail = `test_${Date.now()}@example.com`
    console.log('Intentando crear usuario de prueba:', testEmail)
    
    const { data, error } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: 'testpassword123',
      user_metadata: { test: true },
      email_confirm: true,
    })
    
    console.log('Create user test:', { 
      userId: data?.user?.id, 
      error: error?.message,
      errorDetails: error
    })
    
    // Limpiar usuario de prueba si se creó
    if (data?.user?.id) {
      await supabase.auth.admin.deleteUser(data.user.id)
      console.log('Usuario de prueba eliminado')
    }
    
    return NextResponse.json({
      success: true,
      message: 'Service key verification completed',
      createUserResult: {
        userId: data?.user?.id,
        error: error?.message,
        errorDetails: error
      }
    })
    
  } catch (error) {
    console.error('VERIFY SERVICE KEY ERROR:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
