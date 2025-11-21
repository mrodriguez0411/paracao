import { NextRequest, NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/auth"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const profile = await requireAuth(["super_admin"]) 
    if (!profile) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

    let { id } = params
    if (!id || id === "undefined") {
      // Fallback: extraer desde la URL
      const url = new URL(request.url)
      const parts = url.pathname.split("/")
      const tiposIndex = parts.findIndex((p) => p === "tipos")
      const fromPath = tiposIndex >= 0 ? parts[tiposIndex + 1] : undefined
      if (fromPath && fromPath !== "undefined") {
        id = fromPath as string
      }
    }
    if (!id || id === "undefined") {
      console.error("[PUT /cuotas/tipos/:id] ID inválido", { id, url: request.url })
      return NextResponse.json({ error: `ID inválido (${String(id)})`, url: request.url }, { status: 400 })
    }
    const payload = await request.json()
    const { tipo, nombre, monto, por_disciplina, activo } = payload || {}
    const hasAnyField = [tipo, nombre, monto, por_disciplina, activo].some((v) => v !== undefined)
    if (!hasAnyField) {
      return NextResponse.json({ error: "No hay campos para actualizar" }, { status: 400 })
    }

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
    console.error("[PUT /cuotas/tipos/:id] Error:", err)
    return NextResponse.json({ error: err.message || "Error al actualizar tipo de cuota" }, { status: 500 })
  }
}
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const profile = await requireAuth(["super_admin"]);
    if (!profile) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Get the ID from params first
    let tipoId = params.id;

    // If ID is not in params, try to extract from URL
    if (!tipoId || tipoId === "undefined") {
      const url = new URL(request.url);
      const parts = url.pathname.split("/");
      const tiposIndex = parts.findIndex((p) => p === "tipos");
      if (tiposIndex >= 0 && parts[tiposIndex + 1] && parts[tiposIndex + 1] !== "undefined") {
        tipoId = parts[tiposIndex + 1];
      }
    }

    // Validate ID
    if (!tipoId || tipoId === "undefined") {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    // Delete the record
    const supabase = createServiceRoleClient();
    const { error } = await supabase
      .from("cuotas_tipos")
      .delete()
      .eq("id", tipoId);

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Tipo de cuota eliminado correctamente" });
  } catch (err: any) {
    console.error("[DELETE /cuotas/tipos/:id] Error:", err);
    return NextResponse.json(
      { error: err.message || "Error al eliminar el tipo de cuota" },
      { status: 500 }
    );
  }
}