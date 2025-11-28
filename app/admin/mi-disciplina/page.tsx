import { requireAuth } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { MiDisciplinaTable } from "@/components/admin/mi-disciplina-table"

export default async function MiDisciplinaPage() {
  await requireAuth(["admin_disciplina"])
  const supabase = await createClient()

  const { data: miembros } = await supabase
    .from("miembros_familia")
    .select(`
      id,
      nombre_completo,
      email,
      telefono,
      dni,
      created_at
    `)
    .order("nombre_completo")

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight" style={{color: '#efb600'}}>Miembros de mi Disciplina</h2>
        <p className="text-muted-foreground" style={{color: '#efb600'}}>Aquí puedes ver los miembros que están registrados en tu disciplina.</p>
      </div>

      <MiDisciplinaTable miembros={miembros || []} />
    </div>
  )
}
