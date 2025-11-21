import { NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = createServiceRoleClient()

    const { data, error } = await supabase
      .from("grupos_familiares")
      .select(`
        id,
        nombre,
        cuota_social,
        tipo_cuota_id,
        created_at,
        cuotas_tipos (
          id,
          nombre,
          monto,
          tipo,
          activo
        ),
        profiles:titular_id (
          id,
          nombre_completo,
          email,
          dni,
          telefono
        ),
        miembros_familia (
          id,
          nombre_completo,
          dni,
          parentesco,
          grupo_id,
          socio_id,
          fecha_nacimiento,
          created_at
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[socios-list] Error al obtener socios:", error)
      return NextResponse.json({ error: "No se pudieron obtener los socios" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("[socios-list] Error inesperado:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 }
    )
  }
}
