
import { requireAuth } from "@/lib/auth";
import { MiDisciplinaTable } from "@/components/admin/mi-disciplina-table";
import { redirect } from "next/navigation";

// VERSIÓN FINAL: La página ya no precarga datos, el componente de la tabla se encarga de todo.
export default async function MiDisciplinaPage() {
  const profile = await requireAuth(["admin_disciplina"]);
  if (!profile) {
    redirect("/auth/login");
  }

  return (
    <div className="space-y-6">
      {/* Se pasa un array vacío, la tabla carga los datos por su cuenta */}
      <MiDisciplinaTable miembros={[]} />
    </div>
  );
}
