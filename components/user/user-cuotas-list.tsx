"use client"

import { useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface CuotaWithData {
  id: string
  tipo: "social" | "deportiva"
  mes: number
  anio: number
  monto: number
  fecha_vencimiento: string
  pagada: boolean
  disciplinas: {
    nombre: string
  } | null
}

interface UserCuotasListProps {
  cuotas: CuotaWithData[]
}

const meses = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
]

export function UserCuotasList({ cuotas }: UserCuotasListProps) {
  const formatoARS = useMemo(
    () => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    []
  )

  const handlePagar = (cuotaId: string) => {
    // Lógica para el pago
    alert(`Redirigiendo al pago para la cuota ${cuotaId}`)
  }

  if (cuotas.length === 0) {
    return (
      <Card className="p-8 text-center bg-white/80 backdrop-blur border border-[#1e3a8a]/20">
        <p className="text-muted-foreground">No tienes cuotas registradas por el momento.</p>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cuotas.map((cuota) => {
        const vencida = !cuota.pagada && new Date(cuota.fecha_vencimiento) < new Date()

        return (
          <Card key={cuota.id} className="p-6 flex flex-col justify-between bg-white/80 backdrop-blur border border-[#1e3a8a]/20">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-[#1e3a8a]">
                  {cuota.tipo === "social" ? "Cuota Social" : `Cuota ${cuota.disciplinas?.nombre}`}
                </h3>
                <Badge className={cuota.pagada ? "bg-blue-100 text-blue-800" : vencida ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}>
                  {cuota.pagada ? "Pagada" : vencida ? "Vencida" : "Pendiente"}
                </Badge>
              </div>
              <div className="space-y-2 text-sm">
                <p className="flex justify-between">
                  <span className="text-gray-500">Período:</span>
                  <span className="font-medium text-gray-800">{meses[cuota.mes - 1]} {cuota.anio}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-500">Vencimiento:</span>
                  <span className="font-medium text-gray-800">{new Date(cuota.fecha_vencimiento).toLocaleDateString()}</span>
                </p>
                <p className="flex justify-between text-lg">
                  <span className="text-gray-600">Monto:</span>
                  <span className="font-bold text-[#1e3a8a]">{formatoARS.format(cuota.monto)}</span>
                </p>
              </div>
            </div>
            {!cuota.pagada && (
              <Button 
                onClick={() => handlePagar(cuota.id)} 
                className="w-full mt-6 bg-[#efb600] hover:bg-[#efb600]/90 text-white font-bold"
              >
                Pagar
              </Button>
            )}
          </Card>
        )
      })}
    </div>
  )
}
