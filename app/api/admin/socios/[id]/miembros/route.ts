import { createServiceRoleClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: grupoId } = await params
    const supabase = createServiceRoleClient()

    console.log("[miembros-get] Obteniendo miembros del grupo:", grupoId)

    const { data, error } = await supabase
      .from("miembros_familia")
      .select("id, nombre_completo, dni, parentesco")
      .eq("grupo_id", grupoId)

    if (error) {
      console.error("[miembros-get] Error al obtener miembros:", error)
      return NextResponse.json([], { status: 200 }) // Retornar array vacío si no hay miembros
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error("[miembros-get] Error:", error)
    return NextResponse.json([], { status: 200 }) // Retornar array vacío en caso de error
  }
}
