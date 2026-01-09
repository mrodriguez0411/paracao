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
    .select("*, admin_id")
    .eq("id", params.id)
    .single();

  if (disciplinaError) {
    console.error("Error fetching disciplina:", disciplinaError);
  }

  if (!disciplinaData) {
    notFound();
  }

  // Use the admin client to bypass RLS for fetching admin users
  const { data: admins, error: adminsError } = await supabaseAdmin
    .from("profiles")
    .select("id, nombre_completo, email")
    .eq("rol", "admin_disciplina");

  if (adminsError) {
    console.error("Error fetching admins:", adminsError);
  }

  return <EditarDisciplinaForm disciplina={disciplinaData} admins={admins || []} />;
}
