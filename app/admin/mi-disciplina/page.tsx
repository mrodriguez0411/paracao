
import { requireAuth } from "@/lib/auth";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { MiDisciplinaTable } from "@/components/admin/mi-disciplina-table";
import { redirect } from "next/navigation";

export default async function MiDisciplinaPage() {
  const profile = await requireAuth(["admin_disciplina"]);
  if (!profile) {
    redirect("/auth/login");
  }

  const supabaseService = createServiceRoleClient();

  const { data: miembros, error } = await supabaseService.rpc(
    "get_miembros_por_disciplina",
    { admin_id_param: profile.id }
  );

  if (error) {
    console.error("Error al llamar a la función RPC:", error.message);
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight text-red-500">Error al Cargar Miembros</h2>
        <p className="text-muted-foreground">No se pudieron cargar los datos de la disciplina. <br /> Detalle: {error.message}</p>
      </div>
    );
  }

  const miembrosData = miembros || [];

  // Ya no se calculan las estadísticas aquí, solo se pasan los datos a la tabla.

  return (
    <div className="space-y-6">
      {/* El título y el dashboard se han movido a la nueva página de dashboard */}
      <MiDisciplinaTable miembros={miembrosData} />
    </div>
  );
}
