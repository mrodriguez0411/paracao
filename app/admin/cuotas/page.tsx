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
          <h2 className="text-3xl font-bold tracking-tight">Cuotas</h2>
          <p className="text-muted-foreground">Gestiona los pagos de cuotas sociales y deportivas</p>
        </div>
        {profile.rol === "super_admin" && (
          <Button asChild>
            <Link href="/admin/cuotas/generar">
              <Plus className="mr-2 h-4 w-4" />
              Generar Cuotas
            </Link>
          </Button>
        )}
      </div>

      <CuotasTable cuotas={cuotas || []} />
    </div>
  )
}
