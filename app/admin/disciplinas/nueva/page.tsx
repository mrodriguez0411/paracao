import { requireAuth } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { NuevaDisciplinaForm } from "@/components/admin/nueva-disciplina-form"

export default async function NuevaDisciplinaPage() {
  await requireAuth(["super_admin"])
  const supabase = await createClient()

  // Obtener admins de disciplina disponibles
  const { data: admins } = await supabase
    .from("profiles")
    .select("id, nombre_completo, email")
    .eq("rol", "admin_disciplina")
    .order("nombre_completo")

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Nueva Disciplina</h2>
        <p className="text-muted-foreground">Registra una nueva disciplina deportiva</p>
      </div>

      <NuevaDisciplinaForm admins={admins || []} />
    </div>
  )
}
