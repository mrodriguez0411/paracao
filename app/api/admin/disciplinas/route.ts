import { createServiceRoleClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createServiceRoleClient()
    const { data, error } = await supabase.from("disciplinas").select("id, nombre").order("nombre")
    if (error) {
      console.error("[disciplinas-get] Error:", error)
      return NextResponse.json([], { status: 200 })
    }
    return NextResponse.json(data || [])
  } catch (error) {
    console.error("[disciplinas-get] Error:", error)
    return NextResponse.json([], { status: 200 })
  }
}
