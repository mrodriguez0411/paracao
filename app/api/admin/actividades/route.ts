import { createServiceRoleClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/admin/actividades
// Returns a list of all actividades.
export async function GET(request: Request) {
  const supabase = createServiceRoleClient();

  try {
    const { data, error } = await supabase
      .from("actividades")
      .select("id, nombre")
      .order("nombre", { ascending: true });

    if (error) {
      console.error("Error fetching all actividades:", error);
      throw new Error("No se pudieron cargar las actividades.");
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
