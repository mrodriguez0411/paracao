import { requireAuth } from "@/lib/auth"
import { createServiceRoleClient } from "@/lib/supabase/server"
import { MiDisciplinaTable } from "@/components/admin/mi-disciplina-table"

export default async function MiDisciplinaPage() {
  const profile = await requireAuth(["admin_disciplina"])
  if (!profile) {
    // This should be handled by requireAuth, but as a safeguard
    return null
  }

  // Use the service role client to bypass RLS for this diagnostic query
  const supabase = createServiceRoleClient()

  // 1. Find the discipline administered by the current user
  const { data: disciplina, error: disciplinaError } = await supabase
    .from("disciplinas")
    .select("id")
    .eq("admin_id", profile.id)
    .single()

  if (disciplinaError || !disciplina) {
    console.error("Error fetching discipline for admin:", profile.id, disciplinaError)
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight" style={{color: '#efb600'}}>Miembros de mi Disciplina</h2>
          <p className="text-muted-foreground" style={{color: '#efb600'}}>
            No se encontró una disciplina asignada a tu usuario o ocurrió un error al buscarla.
          </p>
        </div>
        <MiDisciplinaTable miembros={[]} />
      </div>
    )
  }

  // 2. Get all member IDs from the 'inscripciones' table for that discipline
  const { data: inscripciones, error: inscripcionesError } = await supabase
    .from("inscripciones")
    .select("miembro_id")
    .eq("disciplina_id", disciplina.id)

  if (inscripcionesError) {
    console.error("Error fetching inscriptions:", inscripcionesError)
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight" style={{color: '#efb600'}}>Miembros de mi Disciplina</h2>
          <p className="text-muted-foreground" style={{color: '#efb600'}}>Error al consultar los miembros de la disciplina.</p>
        </div>
        <MiDisciplinaTable miembros={[]} />
      </div>
    )
  }

  if (!inscripciones || inscripciones.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight" style={{color: '#efb600'}}>Miembros de mi Disciplina</h2>
          <p className="text-muted-foreground" style={{color: '#efb600'}}>Aún no hay miembros registrados en tu disciplina.</p>
        </div>
        <MiDisciplinaTable miembros={[]} />
      </div>
    )
  }

  const miembroIds = inscripciones.map((i) => i.miembro_id)

  // 3. Fetch all member profiles for those IDs
  const { data: miembros, error: miembrosError } = await supabase
    .from("miembros_familia")
    .select(
      `
      id,
      nombre_completo,
      email,
      telefono,
      dni,
      created_at
    `
    )
    .in("id", miembroIds)
    .order("nombre_completo")

  if (miembrosError) {
    console.error("Error fetching members:", miembrosError)
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight" style={{color: '#efb600'}}>Miembros de mi Disciplina</h2>
          <p className="text-muted-foreground" style={{color: '#efb600'}}>Error al consultar los perfiles de los miembros.</p>
        </div>
        <MiDisciplinaTable miembros={[]} />
      </div>
    )
  }

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