import { requireAuth } from "@/lib/auth"
import { HistorialCuotasClient } from "@/components/admin/historial-cuotas-client"

export default async function HistorialCuotasPage() {
  await requireAuth(["super_admin"])

  return (
    <div className="space-y-6">
      {/* 1. Título y Descripción */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight " style={{color: "#efb600"}}>Historial de Cuotas</h2>
        <p className="text-lg text-[#efb600]">Consulta, filtra y gestiona el estado de todas las cuotas generadas.</p>
      </div>

      {/* 2. Componente Cliente Interactivo */}
      <HistorialCuotasClient />
      
    </div>
  )
}
