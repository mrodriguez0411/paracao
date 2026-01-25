import { createServiceRoleClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("=== DEBUG DISCIPLINAS ===")
    
    // 1. Verificar configuración
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    console.log("URL:", url ? "Presente" : "Faltante")
    console.log("Service Key:", serviceKey ? "Presente" : "Faltante")
    
    // 2. Crear cliente
    const supabase = createServiceRoleClient()
    console.log("Cliente creado")
    
    // 3. Probar conexión básica
    console.log("Probando conexión...")
    
    // 4. Contar disciplinas
    const { count, error: countError } = await supabase
      .from("disciplinas")
      .select("*", { count: "exact", head: true })
    
    console.log("Count disciplinas:", count, "Error:", countError)
    
    // 5. Obtener disciplinas
    const { data, error } = await supabase
      .from("disciplinas")
      .select("id, nombre, activa, admin_id")
      .order("nombre")
    
    console.log("Data disciplinas:", data?.length || 0, "registros")
    console.log("Error disciplinas:", error)
    
    // 6. Probar consulta directa sin RLS
    const { data: rawData, error: rawError } = await supabase
      .rpc('execute_sql', { sql_statement: 'SELECT COUNT(*) as total FROM disciplinas' })
    
    console.log("Raw count error:", rawError)
    
    // 7. Verificar políticas
    const { data: policies, error: policyError } = await supabase
      .rpc('execute_sql', { 
        sql_statement: `
          SELECT policyname, tablename, cmd 
          FROM pg_policies 
          WHERE tablename = 'disciplinas'
        ` 
      })
    
    console.log("Policies error:", policyError)
    
    return NextResponse.json({
      success: true,
      debug: {
        config: { url: !!url, serviceKey: !!serviceKey },
        count,
        disciplinas: data || [],
        countError: countError?.message,
        dataError: error?.message,
        rawData,
        rawError: rawError?.message,
        policies,
        policyError: policyError?.message
      }
    })
    
  } catch (error) {
    console.error("DEBUG ERROR:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
