
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { MiDisciplinaTable } from "@/components/admin/mi-disciplina-table";
import { redirect } from "next/navigation";

export default async function MiDisciplinaPage() {
  // 1. Obtener el perfil del administrador de la disciplina.
  const profile = await requireAuth(["admin_disciplina"]);
  if (!profile) {
    redirect("/auth/login");
  }

  const supabase = await createClient();

  // 2. Encontrar la disciplina gestionada por este administrador.
  const { data: disciplina, error: disciplinaError } = await supabase
    .from("disciplinas")
    .select("id")
    .eq("admin_id", profile.id)
    .limit(1)
    .single();

  // Si no se encuentra una disciplina, el problema está en los datos de la tabla `disciplinas`.
  if (disciplinaError || !disciplina) {
    console.error("Error finding discipline for admin:", disciplinaError?.message);
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight" style={{color: '#efb600'}}>
          Disciplina no encontrada
        </h2>
        <p className="text-muted-foreground" style={{color: '#efb600'}}>
          No se pudo encontrar una disciplina asociada a tu cuenta. Verifica que tu ID de usuario ({profile.id}) esté correctamente asignado en la columna 'admin_id' de la tabla 'disciplinas'.
        </p>
      </div>
    );
  }

  // 3. Obtener los miembros a través de la tabla `inscripciones`.
  // CORREGIDO: La sintaxis de select para joins no debe tener espacios ni saltos de línea.
  const { data: inscripciones, error: miembrosError } = await supabase
    .from("inscripciones")
    .select("miembros_familia(*)") // <--- SINTAXIS CORREGIDA
    .eq("disciplina_id", disciplina.id);

  if (miembrosError) {
    console.error("Error fetching members for discipline:", miembrosError.message);
  }

  // 4. Extraer los datos de los miembros del resultado anidado.
  const miembros = inscripciones ? inscripciones.map(insc => insc.miembros_familia).filter(Boolean) : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight" style={{color: '#efb600'}}>Miembros de mi Disciplina</h2>
        <p className="text-muted-foreground" style={{color: '#efb600'}}>
          Aquí puedes ver los miembros que están registrados en tu disciplina.
        </p>
      </div>

      <MiDisciplinaTable miembros={miembros || []} />
    </div>
  );
}
