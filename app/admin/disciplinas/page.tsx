import { requireAuth } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { DisciplinasTable } from "@/components/admin/disciplinas-table"

export default async function DisciplinasPage() {
  await requireAuth(["super_admin"])
  const supabase = await createClient()

  const { data: disciplinas, error } = await supabase
    .from("disciplinas")
    .select(`
      id,
      nombre,
      descripcion,
      activa,
      admin:admin_id(nombre_completo)
    `)
    .order("nombre", { ascending: true })

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

      <DisciplinasTable disciplinas={disciplinas || []} />
    </div>
  )
}
