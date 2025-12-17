
import { requireAuth } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { UserCuotasList } from "@/components/user/user-cuotas-list"

export default async function UserCuotasPage() {
  const profile = await requireAuth(["socio"])
  const supabase = await createClient()

  if (!profile.grupo_familiar_id) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight text-[#efb600]">Mis Cuotas</h2>
        <div className="bg-white/80 backdrop-blur border border-[#1e3a8a]/20 rounded-md p-6 text-center">
          <p className="text-gray-700">No perteneces a ningún grupo familiar todavía.</p>
          <p className="text-sm text-gray-500 mt-2">
            Para poder ver tus cuotas, el administrador debe asignarte a un grupo.
          </p>
        </div>
      </div>
    )
  }

  const { data: cuotas } = await supabase
    .from("cuotas")
    .select(`
      *,
      disciplinas(nombre)
    `)
    .eq("grupo_familiar_id", profile.grupo_familiar_id)
    .order("fecha_vencimiento", { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-[#efb600]" style={{ color: "#efb600" }}>
          Mis Cuotas
        </h2>
        <p className="text-[#efb600]">Consulta el estado de tus cuotas sociales y deportivas.</p>
      </div>

       <div className="bg-white/80 backdrop-blur border border-[#1e3a8a]/20 rounded-md p-3 text-sm text-blue-900/80">
        <p>
          Recuerda que el <span className="font-semibold">vencimiento</span> de las cuotas es el día <span className="font-semibold">10</span> de cada mes.
          Si no se abona a tiempo, se mostrará como <span className="font-semibold text-red-700">Vencida</span>.
        </p>
      </div>

      <UserCuotasList cuotas={cuotas || []} />
    </div>
  )
}
