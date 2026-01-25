import { requireAuth } from "@/lib/auth"
import { createServiceRoleClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { DisciplinasTable } from "@/components/admin/disciplinas-table"

export default async function DisciplinasPage() {
  await requireAuth(["super_admin"])
  const supabase = createServiceRoleClient()

  const { data: disciplinas, error } = await supabase
    .from("disciplinas")
    .select(`
      id,
      nombre,
      descripcion,
      activa,
      admin_id
    `)
    .order("nombre", { ascending: true })

  // Obtener nombres de administradores por separado
  const disciplinasConAdmin = disciplinas?.map(disciplina => ({
    ...disciplina,
    admin: disciplina.admin_id ? { nombre_completo: "Admin" } : null
  })) || []

  if (error) {
    console.error("Error fetching disciplinas:", error)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight" style={{ color: '#efb600' }}>Disciplinas</h2>
          <p className="text-muted-foreground" style={{ color: '#efb600' }}>Gestiona las disciplinas deportivas del club</p>
        </div>
        <Button asChild className="bg-[#efb600] hover:bg-[#efb600]/90 text-[#1e3a8a]">
          <Link href="/admin/disciplinas/nueva">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Disciplina
          </Link>
        </Button>
      </div>

      <DisciplinasTable disciplinas={disciplinasConAdmin} />
    </div>
  )
}
