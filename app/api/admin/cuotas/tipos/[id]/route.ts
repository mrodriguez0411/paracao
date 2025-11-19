import { NextRequest, NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/auth"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const profile = await requireAuth(["super_admin"]) 
    if (!profile) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

    const { id } = params
    const payload = await request.json()
    const { tipo, nombre, monto, por_disciplina, activo } = payload || {}

    const supabase = createServiceRoleClient()
    const { data, error } = await supabase
      .from("cuotas_tipos")
      .update({
        ...(tipo !== undefined ? { tipo } : {}),
        ...(nombre !== undefined ? { nombre } : {}),
        ...(monto !== undefined ? { monto } : {}),
        ...(por_disciplina !== undefined ? { por_disciplina } : {}),
        ...(activo !== undefined ? { activo } : {}),
      })
      .eq("id", id)
      .select("id, tipo, nombre, monto, por_disciplina, activo")
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Error al actualizar tipo de cuota" }, { status: 500 })
  }
}
