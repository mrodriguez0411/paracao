import { NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase/server"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createServiceRoleClient()

    // Llamar a la función RPC en lugar de hacer un select directo
    const { data, error } = await supabase.rpc('get_all_grupos_familiares')

    if (error) {
      console.error("[socios-list] Error al llamar RPC get_all_grupos_familiares:", error)
      return NextResponse.json({ error: "No se pudieron obtener los socios" }, { status: 500 })
    }

    // La función RPC devuelve un único objeto JSON que es un array de grupos
    return NextResponse.json(data)
    
  } catch (error) {
    console.error("[socios-list] Error inesperado:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 }
    )
  }
}
