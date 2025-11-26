import { requireAuth } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { CuotasTable } from "@/components/admin/cuotas-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default async function CuotasPage() {
  const profile = await requireAuth(["super_admin", "admin_disciplina"])
  const supabase = await createClient()

  const { data: cuotas } = await supabase
    .from("cuotas")
    .select(`
      *,
      grupos_familiares(nombre, profiles:titular_id(nombre_completo)),
      disciplinas(nombre)
    `)
    .order("fecha_vencimiento", { ascending: false })
    .limit(100)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[#efb600]" style={{ color: "#efb600" }}>Cuotas</h2>
          <p className="text-[#efb600]">Gestiona los pagos de cuotas sociales y deportivas</p>
        </div>
        {profile.rol === "super_admin" && (
          <Button asChild className="bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white">
            <Link href="/admin/cuotas/generar">
              <Plus className="mr-2 h-4 w-4" />
              Generar Cuotas
            </Link>
          </Button>
        )}
      </div>

      <div className="bg-white/80 backdrop-blur border border-[#1e3a8a]/20 rounded-md p-3 text-sm text-blue-900/80">
        <p>
          Las cuotas mensuales se componen por la <span className="font-semibold">cuota social</span> del grupo
          y las <span className="font-semibold">cuotas deportivas</span> por cada inscripción de titular o miembro.
          El <span className="font-semibold">vencimiento</span> es el día <span className="font-semibold">10</span> de cada mes.
          Si no está pagada a tiempo, se mostrará como <span className="font-semibold text-red-700">Vencida</span>.
        </p>
      </div>

      <CuotasTable cuotas={cuotas || []} />
    </div>
  )
}
