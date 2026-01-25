import { createServiceRoleClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createServiceRoleClient()
    const { data, error } = await supabase
      .from("disciplinas")
      .select("id, nombre")
      .order("nombre")
    
    if (error) {
      console.error("Error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      count: data?.length || 0,
      data: data || []
    })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 })
  }
}
