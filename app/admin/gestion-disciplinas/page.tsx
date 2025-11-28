import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { GestionDisciplinasClient } from "@/components/admin/gestion-disciplinas-client";

export default async function GestionDisciplinasPage() {
  // 1. Proteger la página para que solo los super administradores puedan verla
  await requireAuth(["super_admin"]);

  const supabase = await createClient();

  // 2. Obtener la lista de todas las disciplinas (consulta simplificada)
  const { data: disciplinas, error: disciplinasError } = await supabase
    .from("disciplinas")
    .select(`
      id,
      nombre,
      admin_id
    `)
    .order("nombre");

  if (disciplinasError) {
    console.error("Error fetching disciplinas:", disciplinasError);
    // Considera mostrar un mensaje de error más amigable aquí
  }

  // 3. Obtener la lista de todos los usuarios que pueden ser administradores
  const { data: admins, error: adminsError } = await supabase
    .from("profiles")
    .select("id, nombre_completo")
    .eq("rol", "admin_disciplina")
    .order("nombre_completo");

  if (adminsError) {
    console.error("Error fetching admin profiles:", adminsError);
    // Considera mostrar un mensaje de error más amigable aquí
  }

  // 4. Pasar los datos a un componente cliente que manejará la interfaz
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight" style={{color: '#efb600'}}>
          Gestión de Disciplinas
        </h2>
        <p className="text-muted-foreground" style={{color: '#efb600'}}>
          Asigna un administrador a cada disciplina.
        </p>
      </div>
      <GestionDisciplinasClient
        disciplinas={disciplinas || []}
        admins={admins || []}
      />
    </div>
  );
}
