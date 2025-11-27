import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { EditarDisciplinaForm } from "@/components/admin/editar-disciplina-form";
import { createServiceRoleClient } from "@/lib/supabase/server";

export default async function EditarDisciplinaPage({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies });
  const supabaseAdmin = createServiceRoleClient();

  const { data: disciplinaData, error: disciplinaError } = await supabase
    .from("disciplinas")
    .select("*")
    .eq("id", params.id)
    .single();

  if (disciplinaError) {
    console.error("Error fetching disciplina:", disciplinaError);
  }

  if (!disciplinaData) {
    notFound();
  }

  const { data: adminDisciplina, error: adminDisciplinaError } = await supabase
    .from("admin_disciplinas")
    .select("admin_id")
    .eq("disciplina_id", params.id)
    .maybeSingle();

  if (adminDisciplinaError) {
    console.error("Error fetching admin_disciplina:", adminDisciplinaError);
  }

  // Use the admin client to bypass RLS for fetching admin users
  const { data: admins, error: adminsError } = await supabaseAdmin
    .from("profiles")
    .select("id, nombre_completo, email")
    .eq("rol", "admin_disciplina");

  if (adminsError) {
    console.error("Error fetching admins:", adminsError);
  }

  // Augment disciplina object with admin_id
  const disciplina = {
    ...disciplinaData,
    admin_id: adminDisciplina?.admin_id || null
  };

  return <EditarDisciplinaForm disciplina={disciplina} admins={admins || []} />;
}
