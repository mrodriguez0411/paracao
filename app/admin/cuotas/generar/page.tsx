import { requireAuth } from "@/lib/auth"
import { GenerarCuotasForm } from "@/components/admin/generar-cuotas-form"

export default async function GenerarCuotasPage() {
  await requireAuth(["super_admin"])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-[#efb600]" style={{ color: "#efb600" }}>
          Generar Cuotas
        </h2>
        <p className="text-[#efb600]">
          Genera las cuotas sociales y deportivas para todos los grupos y miembros.
        </p>
      </div>

      <div className="bg-white/80 backdrop-blur border border-[#1e3a8a]/20 rounded-md p-3 text-sm text-blue-900/80">
        <p>
          Selecciona el mes y año para generar las cuotas. El sistema creará una cuota social por cada grupo familiar y una cuota deportiva por cada disciplina en la que un miembro esté inscripto.
        </p>
        <p className="mt-2 font-semibold">
          Importante: El sistema no creará cuotas duplicadas si ya existen para el período seleccionado.
        </p>
      </div>

      <GenerarCuotasForm />
    </div>
  )
}
