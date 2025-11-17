import { requireAuth } from "@/lib/auth"
import { createServiceRoleClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { SociosTable } from "@/components/admin/socios-table"

export default async function SociosPage() {
  await requireAuth(["super_admin"])
  const supabase = createServiceRoleClient()

  const { data: grupos } = await supabase
    .from("grupos_familiares")
    .select(`
      *,
      profiles:titular_id(nombre_completo, email, dni),
      miembros_familia(count)
    `)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Socios</h2>
          <p className="text-muted-foreground">Gestiona los grupos familiares y sus miembros</p>
        </div>
        <Button asChild>
          <Link href="/admin/socios/nuevo">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Socio
          </Link>
        </Button>
      </div>

      <SociosTable grupos={grupos || []} />
    </div>
  )
}
