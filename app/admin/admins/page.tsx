import { requireAuth } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { AdminsTable } from "@/components/admin/admins-table"

export default async function AdminsPage() {
  await requireAuth(["super_admin"])
  const supabase = await createClient()

  // Fetch all profiles with role admin_disciplina
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, nombre_completo, email, telefono, created_at')
    .eq('rol', 'admin_disciplina')
    .order('nombre_completo')

  if (profilesError) {
    console.error('[admins-page] Error fetching profiles:', profilesError)
  }

  const adminIds = (profiles || []).map((p: any) => p.id)

  // Fetch admin_disciplinas assignments for these admins (skip if none)
  let assignments: any[] = []
  if (adminIds.length > 0) {
    const { data: assignmentsData, error: assignmentsError } = await supabase
      .from('admin_disciplinas')
      .select('admin_id, disciplina_id, nombre')
      .in('admin_id', adminIds)

    if (assignmentsError) {
      console.error('[admins-page] Error fetching admin_disciplinas:', assignmentsError)
    } else {
      assignments = assignmentsData || []
    }
  }

  // Map profiles to the shape expected by AdminsTable
  const admins = (profiles || []).map((p: any) => ({
    ...p,
    disciplinas: assignments.filter((a: any) => a.admin_id === p.id).map((a: any) => ({ nombre: a.nombre }))
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight" style={{color: '#efb600'}}>Administradores de Disciplina</h2>
          <p className="text-muted-foreground" style={{color: '#efb600'}}>Gestiona los administradores de cada disciplina</p>
        </div>
        <Button asChild className="bg-[#efb600] hover:bg-[#efb600]/90 text-white" >
          <Link href="/admin/admins/nuevo" style={{color: '#1e3a8a'}}>
            <Plus className="mr-2 h-4 w-4"/>
            Nuevo Admin
          </Link>
        </Button>
      </div>

      <AdminsTable admins={admins || []} />
    </div>
  )
}
