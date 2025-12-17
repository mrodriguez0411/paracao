import { requireAuth } from "@/lib/auth"
import { Cog, History, Users, WalletCards } from "lucide-react"
import Link from "next/link"

export default async function CuotasDashboardPage() {
  await requireAuth(["super_admin"])

  const actions = [
    {
      title: "Generar Cuotas Mensuales",
      description: "Inicia el proceso mensual para crear las cuotas sociales y deportivas de todos los miembros.",
      href: "/admin/cuotas/generar",
      icon: WalletCards,
      color: "text-[#ebf600]",
      bgColor: "bg-[#1e3a8a]/10"
    },
    {
      title: "Configurar Tipos de Cuota",
      description: "Define y edita los montos para las cuotas sociales (individual, familiar) y deportivas.",
      href: "/admin/cuotas/tipos",
      icon: Cog,
      color: "text-green-600",
      bgColor: "bg-green-600/10"
    },
    {
      title: "Historial de Cuotas",
      description: "Consulta el estado de las cuotas, busca por socio y registra pagos de forma manual.",
      href: "/admin/historial-cuotas",
      icon: History,
      color: "text-amber-600",
      bgColor: "bg-amber-600/10"
    },
     {
      title: "Ver Socios",
      description: "Administra los grupos familiares y sus miembros.",
      href: "/admin/socios",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-600/10"
    },
  ]

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight " style={{color:"#efb600"}}>Gestión de Cuotas</h1>
        <p className="mt-2 text-lg text-[#efb600]">
          Panel central para administrar todo lo relacionado con las cuotas del club.
        </p>
      </div>

      <div className="bg-white/80 backdrop-blur border border-[#1e3a8a]/20 rounded-lg p-6 text-center shadow-sm">
        <h3 className="font-semibold text-lg text-[#1e3a8a]">¿Cómo funciona?</h3>
        <p className="text-gray-600 mt-2 max-w-3xl mx-auto">
          El día 1 de cada mes, usa la opción <strong>Generar Cuotas Mensuales</strong>. El sistema creará automáticamente la deuda de la cuota social para cada grupo y las cuotas deportivas para los miembros inscriptos a disciplinas. Luego, podrás ver y gestionar el estado de estas cuotas en el <strong>Historial</strong>.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {actions.map((action) => (
          <Link href={action.href} key={action.title} className="block p-6 bg-white/80 backdrop-blur border border-[#1e3a8a]/20 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-full ${action.bgColor}`}>
                 <action.icon className={`h-7 w-7 ${action.color}`} />
              </div>
              <div>
                <h3 className={`text-xl font-bold ${action.color}`}>{action.title}</h3>
              </div>
            </div>
            <p className="mt-3 text-gray-700">{action.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
