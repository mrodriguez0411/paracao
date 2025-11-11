import { requireAuth } from "@/lib/auth"
import { NuevoAdminForm } from "@/components/admin/nuevo-admin-form"

export default async function NuevoAdminPage() {
  await requireAuth(["super_admin"])

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Nuevo Administrador de Disciplina</h2>
        <p className="text-muted-foreground">Crea un nuevo administrador para gestionar una disciplina</p>
      </div>

      <NuevoAdminForm />
    </div>
  )
}
