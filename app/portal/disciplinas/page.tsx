import { requireAuth } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy } from "lucide-react"

export default async function DisciplinasPage() {
  const profile = await requireAuth(["socio"])
  const supabase = await createClient()

  const { data: grupoFamiliar } = await supabase
    .from("grupos_familiares")
    .select("id")
    .eq("titular_id", profile.id)
    .single()

  if (!grupoFamiliar) {
    return <div>No tienes grupo familiar</div>
  }

  // Obtener todas las inscripciones del grupo familiar
  const { data: inscripciones } = await supabase
    .from("inscripciones")
    .select(`
      *,
      miembros_familia(nombre_completo),
      disciplinas(nombre, descripcion, cuota_deportiva)
    `)
    .eq("miembros_familia.grupo_id", grupoFamiliar.id)
    .eq("activa", true)

  // Agrupar por disciplina
  const disciplinasMap = new Map()
  inscripciones?.forEach((insc) => {
    const disciplinaId = insc.disciplinas.nombre
    if (!disciplinasMap.has(disciplinaId)) {
      disciplinasMap.set(disciplinaId, {
        disciplina: insc.disciplinas,
        miembros: [],
      })
    }
    disciplinasMap.get(disciplinaId).miembros.push(insc.miembros_familia.nombre_completo)
  })

  const disciplinas = Array.from(disciplinasMap.values())

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Disciplinas</h2>
        <p className="text-muted-foreground">Disciplinas en las que está inscrita tu familia</p>
      </div>

      {disciplinas.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {disciplinas.map(({ disciplina, miembros }) => (
            <Card key={disciplina.nombre}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  {disciplina.nombre}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {disciplina.descripcion && <p className="text-sm text-muted-foreground">{disciplina.descripcion}</p>}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Cuota Deportiva:</span>
                  <span className="font-medium">${disciplina.cuota_deportiva}</span>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Miembros inscritos:</p>
                  <div className="flex flex-wrap gap-2">
                    {miembros.map((miembro: string, idx: number) => (
                      <Badge key={idx} variant="secondary">
                        {miembro}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Tu familia no está inscrita en ninguna disciplina</p>
        </Card>
      )}
    </div>
  )
}
