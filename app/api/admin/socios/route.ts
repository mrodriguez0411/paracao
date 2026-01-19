import { createServiceRoleClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// --- Handler para GET (VERSIÓN FINAL BASADA EN EL CONTRATO DE DATOS DEL FRONTEND) ---
export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceRoleClient();

    // ESTA ES LA CONSULTA CORRECTA, BASADA EN LA INTERFAZ 'GrupoWithData' de socios-table.tsx
    const { data, error } = await supabase
      .from("grupos_familiares")
      .select(`
        id,
        nombre,
        cuota_social,
        tipo_cuota_id,
        activo,
        created_at,
        titular_id,
        cuotas_tipos (*),
        profiles:titular_id (*),
        miembros_familia (*)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      // Si la consulta a la base de datos falla, la aplicación debe saberlo.
      throw new Error(`Error de Supabase al consultar grupos familiares: ${error.message}`);
    }

    // La API ahora devuelve los datos en el formato exacto que el frontend espera.
    // No se necesita ninguna transformación adicional aquí.
    // Si 'data' es null, se enviará un array vacío, lo cual es correcto.
    return NextResponse.json(data || []);

  } catch (error) {
    console.error("[API Socios LIST GET - VERSIÓN FINAL]", error);
    // Devolvemos el mensaje de error para que pueda ser depurado si algo más falla.
    return NextResponse.json({ message: error instanceof Error ? error.message : "Error fatal en el servidor al obtener la lista de socios." }, { status: 500 });
  }
}
