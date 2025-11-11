import { requireAuth } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { AdminsTable } from "@/components/admin/admins-table"

export default async function AdminsPage() {
  await requireAuth(["super_admin"])
  const supabase = await createClient()

  const { data: admins } = await supabase
    .from("profiles")
    .select(`
      *,
      disciplinas:disciplinas!admin_id(nombre)
    `)
    .eq("rol", "admin_disciplina")
    .order("nombre_completo")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Administradores de Disciplina</h2>
          <p className="text-muted-foreground">Gestiona los administradores de cada disciplina</p>
        </div>
        <Button asChild>
          <Link href="/admin/admins/nuevo">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Admin
          </Link>
        </Button>
      </div>

      <AdminsTable admins={admins || []} />
    </div>
  )
}
