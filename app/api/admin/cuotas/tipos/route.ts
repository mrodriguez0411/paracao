import { NextRequest, NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/auth"

export async function GET() {
  try {
    const supabase = createServiceRoleClient()
    const { data, error } = await supabase
      .from("cuotas_tipos")
      .select("id, tipo, nombre, monto, por_disciplina, activo")
      .order("tipo", { ascending: true })

    if (error) throw error
    return NextResponse.json(data || [])
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Error al listar tipos de cuota" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Aseguramos sesión de admin
    const profile = await requireAuth(["super_admin"]) 
    if (!profile) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

    const payload = await request.json()
    const { tipo, nombre, monto, por_disciplina = false, activo = true } = payload || {}

    if (!tipo || !nombre || typeof monto !== "number") {
      return NextResponse.json({ error: "tipo, nombre y monto son requeridos" }, { status: 400 })
    }

    const supabase = createServiceRoleClient()
    const { data, error } = await supabase
      .from("cuotas_tipos")
      .insert({ tipo, nombre, monto, por_disciplina, activo })
      .select("id, tipo, nombre, monto, por_disciplina, activo")
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Error al crear tipo de cuota" }, { status: 500 })
  }
}
