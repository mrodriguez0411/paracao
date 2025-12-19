
import { requireAuth } from "@/lib/auth";
import { getMiembrosPorDisciplina } from "@/app/admin/mi-disciplina/actions";
import { MiDisciplinaTable } from "@/components/admin/mi-disciplina-table";
import { redirect } from "next/navigation";

export default async function MiDisciplinaPage() {
  const profile = await requireAuth(["admin_disciplina"]);
  if (!profile) {
    redirect("/auth/login");
  }

  // La llamada a getMiembrosPorDisciplina ya no necesita parámetros.
  const { data: miembros, error } = await getMiembrosPorDisciplina();

  if (error) {
    console.error("Error al cargar los miembros:", error);
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight text-red-500">Error al Cargar Miembros</h2>
        <p className="text-muted-foreground">No se pudieron cargar los datos de la disciplina. <br /> Detalle: {error}</p>
      </div>
    );
  }

  const miembrosData = miembros || [];

  return (
    <div className="space-y-6">
      <MiDisciplinaTable miembros={miembrosData} />
    </div>
  );
}
