import { requireAuth } from "@/lib/auth"
import { NuevoSocioForm } from "@/components/admin/nuevo-socio-form"

export default async function NuevoSocioPage() {
  await requireAuth(["super_admin"])

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Nuevo Socio</h2>
        <p className="text-muted-foreground">Registra un nuevo grupo familiar en el club</p>
      </div>

      <NuevoSocioForm />
    </div>
  )
}
