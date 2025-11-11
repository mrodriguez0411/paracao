import { requireAuth } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, CreditCard, TrendingUp } from "lucide-react"
import { MiDisciplinaTable } from "@/components/admin/mi-disciplina-table"

export default async function MiDisciplinaPage() {
  const profile = await requireAuth(["admin_disciplina"])
  const supabase = await createClient()

  // Obtener la disciplina del admin
  const { data: disciplina } = await supabase.from("disciplinas").select("*").eq("admin_id", profile.id).single()

  if (!disciplina) {
    return (
      <div className="space-y-6">
        <Card className="p-8 text-center">
          <CardTitle className="mb-4">No tienes una disciplina asignada</CardTitle>
          <p className="text-muted-foreground">Contacta al administrador principal para que te asigne una disciplina</p>
        </Card>
      </div>
    )
  }

  // Obtener inscripciones de la disciplina
  const { data: inscripciones } = await supabase
    .from("inscripciones")
    .select(`
      *,
      miembros_familia(
        *,
        grupos_familiares(
          *,
          profiles:titular_id(nombre_completo, email)
        )
      ),
      disciplinas(nombre, cuota_deportiva)
    `)
    .eq("disciplina_id", disciplina.id)
    .eq("activa", true)

  // Obtener cuotas deportivas de esta disciplina
  const { data: cuotas } = await supabase
    .from("cuotas")
    .select("*")
    .eq("disciplina_id", disciplina.id)
    .eq("tipo", "deportiva")

  const totalInscritos = inscripciones?.length || 0
  const cuotasPendientes = cuotas?.filter((c) => !c.pagada).length || 0
  const totalRecaudado = cuotas?.filter((c) => c.pagada).reduce((sum, c) => sum + Number(c.monto), 0) || 0

  const stats = [
    {
      title: "Socios Inscritos",
      value: totalInscritos,
      icon: Users,
    },
    {
      title: "Cuotas Pendientes",
      value: cuotasPendientes,
      icon: CreditCard,
    },
    {
      title: "Total Recaudado",
      value: `$${totalRecaudado.toFixed(2)}`,
      icon: TrendingUp,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{disciplina.nombre}</h2>
        <p className="text-muted-foreground">Gestiona los socios de tu disciplina</p>
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
          <CardTitle>Información de la Disciplina</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cuota Deportiva:</span>
            <span className="font-medium">${disciplina.cuota_deportiva}</span>
          </div>
          {disciplina.descripcion && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Descripción:</span>
              <span className="font-medium">{disciplina.descripcion}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <div>
        <h3 className="text-xl font-semibold mb-4">Socios Inscritos</h3>
        <MiDisciplinaTable inscripciones={inscripciones || []} />
      </div>
    </div>
  )
}
