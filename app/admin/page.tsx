import { requireAuth } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Trophy, CreditCard, DollarSign } from "lucide-react"

export default async function AdminDashboard() {
  const profile = await requireAuth(["super_admin", "admin_disciplina"])
  const supabase = await createClient()

  const isSuperAdmin = profile.rol === "super_admin"

  // Obtener estadísticas
  const [{ count: totalSocios }, { count: totalDisciplinas }, { count: cuotasPendientes }, { data: cuotasDelMes }] =
    await Promise.all([
      supabase.from("grupos_familiares").select("*", { count: "exact", head: true }),
      supabase.from("disciplinas").select("*", { count: "exact", head: true }).eq("activa", true),
      supabase.from("cuotas").select("*", { count: "exact", head: true }).eq("pagada", false),
      supabase
        .from("cuotas")
        .select("monto")
        .eq("pagada", true)
        .gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
    ])

  const totalRecaudado = cuotasDelMes?.reduce((sum, cuota) => sum + Number(cuota.monto), 0) || 0

  const stats = [
    {
      title: "Grupos Familiares",
      value: totalSocios || 0,
      icon: Users,
      show: isSuperAdmin,
    },
    {
      title: "Disciplinas Activas",
      value: totalDisciplinas || 0,
      icon: Trophy,
      show: isSuperAdmin,
    },
    {
      title: "Cuotas Pendientes",
      value: cuotasPendientes || 0,
      icon: CreditCard,
      show: true,
    },
    {
      title: "Recaudado (Mes)",
      value: `$${totalRecaudado.toFixed(2)}`,
      icon: DollarSign,
      show: true,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Bienvenido, {profile.nombre_completo}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats
          .filter((stat) => stat.show)
          .map((stat) => {
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
          <CardTitle>Accesos Rápidos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {isSuperAdmin && (
            <>
              <p className="text-sm text-muted-foreground">
                • Gestiona socios, disciplinas y cuotas desde el menú lateral
              </p>
              <p className="text-sm text-muted-foreground">• Asigna administradores a cada disciplina</p>
            </>
          )}
          <p className="text-sm text-muted-foreground">• Registra pagos de cuotas en la sección Cuotas</p>
        </CardContent>
      </Card>
    </div>
  )
}
