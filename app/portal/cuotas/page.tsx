import { requireAuth } from "@/lib/auth"
import { createServiceRoleClient } from "@/lib/supabase/server"
import { CuotasSocioTable } from "@/components/portal/cuotas-socio-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle } from "lucide-react"

export default async function CuotasPage() {
  const profile = await requireAuth(["socio"])
  const supabase = createServiceRoleClient()

  const { data: grupoFamiliar } = await supabase
    .from("grupos_familiares")
    .select("id, nombre")
    .eq("titular_id", profile.id)
    .single()

  if (!grupoFamiliar) {
    return <div>No tienes grupo familiar</div>
  }

  const { data: cuotas } = await supabase
    .from("cuotas")
    .select(`
      *,
      disciplinas(nombre)
    `)
    .eq("grupo_id", grupoFamiliar.id)
    .order("fecha_vencimiento", { ascending: false })

  const cuotasPendientes = cuotas?.filter((c) => !c.pagada) || []
  const cuotasPagadas = cuotas?.filter((c) => c.pagada) || []
  const totalPendiente = cuotasPendientes.reduce((sum, c) => sum + Number(c.monto), 0)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight" style={{color:"#efb600"}}>Mis Cuotas</h2>
        <p className="text-muted-foreground" style={{color:"#efb600"}}>Estado de pagos del grupo {grupoFamiliar.nombre}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Cuotas Pendientes</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cuotasPendientes.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Total: ${totalPendiente.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Cuotas Pagadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cuotasPagadas.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Este año</p>
          </CardContent>
        </Card>
      </div>

      <CuotasSocioTable cuotas={cuotas || []} />
    </div>
  )
}
