import { requireAuth } from "@/lib/auth"
import { createServiceRoleClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Trophy, CreditCard, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default async function PortalDashboard() {
  const profile = await requireAuth(["socio"])
  const supabase = createServiceRoleClient()

  // Obtener grupo familiar del socio
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
          <AlertDescription>No tienes un grupo familiar asignado. Contacta al administrador.</AlertDescription>
        </Alert>
      </div>
    )
  }

  // Obtener miembros del grupo
  const { data: miembros } = await supabase
    .from("miembros_familia")
    .select("*, inscripciones(count)")
    .eq("grupo_id", grupoFamiliar.id)

  // Obtener cuotas pendientes
  const { data: cuotasPendientes } = await supabase
    .from("cuotas")
    .select("*")
    .eq("grupo_id", grupoFamiliar.id)
    .eq("pagada", false)

  // Obtener total de inscripciones activas
  const { data: inscripcionesActivas } = await supabase
    .from("inscripciones")
    .select("*, miembros_familia!inner(grupo_id)")
    .eq("miembros_familia.grupo_id", grupoFamiliar.id)
    .eq("activa", true)

  const totalMiembros = miembros?.length || 0
  const totalInscripciones = inscripcionesActivas?.length || 0
  const totalPendiente = cuotasPendientes?.reduce((sum, c) => sum + Number(c.monto), 0) || 0

  const stats = [
    {
      title: "Miembros de la Familia",
      value: totalMiembros,
      icon: Users,
    },
    {
      title: "Inscripciones Activas",
      value: totalInscripciones,
      icon: Trophy,
    },
    {
      title: "Saldo Pendiente",
      value: `$${totalPendiente.toFixed(2)}`,
      icon: CreditCard,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight" style={{color:"#efb600"}}>Bienvenido, {profile.nombre_completo}</h2>
        <p className="text-muted-foreground"style={{color:"#efb600"}}>Grupo Familiar: {grupoFamiliar.nombre}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Grupo Familiar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cuota Social Mensual:</span>
            <span className="font-medium">${grupoFamiliar.cuota_social}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Estado:</span>
            <span className="font-medium">
              {cuotasPendientes && cuotasPendientes.length > 0 ? (
                <span className="text-destructive">Tiene cuotas pendientes</span>
              ) : (
                <span className="text-green-600">Al día</span>
              )}
            </span>
          </div>
        </CardContent>
      </Card>

      {cuotasPendientes && cuotasPendientes.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Tienes {cuotasPendientes.length} cuota(s) pendiente(s) por un total de ${totalPendiente.toFixed(2)}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
