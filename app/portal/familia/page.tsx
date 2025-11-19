import { requireAuth } from "@/lib/auth"
import { createServiceRoleClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MiembroCard } from "@/components/portal/miembro-card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default async function FamiliaPage() {
  const profile = await requireAuth(["socio"])
  const supabase = createServiceRoleClient()

  const { data: grupoFamiliar } = await supabase
    .from("grupos_familiares")
    .select("*")
    .eq("titular_id", profile.id)
    .single()

  if (!grupoFamiliar) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>No tienes un grupo familiar asignado.</AlertDescription>
        </Alert>
      </div>
    )
  }

  const { data: miembros } = await supabase
    .from("miembros_familia")
    .select(`
      *,
      inscripciones(
        *,
        disciplinas(nombre, cuota_deportiva)
      )
    `)
    .eq("grupo_id", grupoFamiliar.id)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight" style={{color:"#efb600"}}>Mi Familia</h2>
        <p className="text-muted-foreground" style={{color:"#efb600"}}>Grupo Familiar: {grupoFamiliar.nombre}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Grupo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Titular:</span>
            <span className="font-medium">{profile.nombre_completo}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email:</span>
            <span className="font-medium">{profile.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cuota Social:</span>
            <span className="font-medium">${grupoFamiliar.cuota_social}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total de Miembros:</span>
            <span className="font-medium">{miembros?.length || 0}</span>
          </div>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-xl font-semibold mb-4" style={{color:"#efb600"}}>Miembros del Grupo</h3>
        {miembros && miembros.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {miembros.map((miembro) => (
              <MiembroCard key={miembro.id} miembro={miembro} />
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No hay miembros registrados en tu grupo familiar</p>
          </Card>
        )}
      </div>
    </div>
  )
}
