import { requireAuth } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Trophy, CreditCard, DollarSign } from "lucide-react"
import { redirect } from "next/navigation"

export default async function AdminDashboard() {
  const profile = await requireAuth(["super_admin", "admin_disciplina"])

  if (profile.rol === "admin_disciplina") {
    redirect("/admin/mi-disciplina")
  }

  const supabase = await createClient()

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
    },
    {
      title: "Disciplinas Activas",
      value: totalDisciplinas || 0,
      icon: Trophy,
    },
    {
      title: "Cuotas Pendientes",
      value: cuotasPendientes || 0,
      icon: CreditCard,
    },
    {
      title: "Recaudado (Mes)",
      value: `$${totalRecaudado.toFixed(2)}`,
      icon: DollarSign,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight" style={{ color: "#efb600" }}>Dashboard</h2>
        <p style={{ color: "#efb600" }}>Bienvenido, {profile.nombre_completo}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="bg-white/80 backdrop-blur border border-[#1e3a8a]/20 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-[#1e3a8a]">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-[#1e3a8a]" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold text-[#1e3a8a]">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="bg-white/80 backdrop-blur border border-[#1e3a8a]/20 shadow-sm">
        <CardHeader>
          <CardTitle className="text-[#1e3a8a]">Accesos Rápidos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-blue-900/80">
          <p className="text-sm">
            • Gestiona socios, disciplinas y cuotas desde el menú lateral
          </p>
          <p className="text-sm">• Asigna administradores a cada disciplina</p>
          <p className="text-sm">• Registra pagos de cuotas en la sección Cuotas</p>
        </CardContent>
      </Card>
    </div>
  )
}
