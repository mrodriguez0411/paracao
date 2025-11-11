import { requireAuth } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { MisCuotasTable } from "@/components/admin/mis-cuotas-table"

export default async function MisCuotasPage() {
  const profile = await requireAuth(["admin_disciplina"])
  const supabase = await createClient()

  // Obtener la disciplina del admin
  const { data: disciplina } = await supabase
    .from("disciplinas")
    .select("id, nombre")
    .eq("admin_id", profile.id)
    .single()

  if (!disciplina) {
    return (
      <div className="space-y-6">
        <div className="text-center p-8">
          <p className="text-muted-foreground">No tienes una disciplina asignada</p>
        </div>
      </div>
    )
  }

  // Obtener cuotas deportivas de esta disciplina
  const { data: cuotas } = await supabase
    .from("cuotas")
    .select(`
      *,
      grupos_familiares(nombre, profiles:titular_id(nombre_completo, email))
    `)
    .eq("disciplina_id", disciplina.id)
    .eq("tipo", "deportiva")
    .order("fecha_vencimiento", { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Cuotas de {disciplina.nombre}</h2>
        <p className="text-muted-foreground">Gestiona las cuotas deportivas de tu disciplina</p>
      </div>

      <MisCuotasTable cuotas={cuotas || []} />
    </div>
  )
}
