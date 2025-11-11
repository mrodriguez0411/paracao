"use client"

import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface CuotaWithData {
  id: string
  mes: number
  anio: number
  monto: number
  fecha_vencimiento: string
  pagada: boolean
  fecha_pago: string | null
  grupos_familiares: {
    nombre: string
    profiles: {
      nombre_completo: string
      email: string
    }
  }
}

interface MisCuotasTableProps {
  cuotas: CuotaWithData[]
}

const meses = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
]

export function MisCuotasTable({ cuotas }: MisCuotasTableProps) {
  const router = useRouter()
  const { toast } = useToast()

  const handleMarcarPagada = async (cuotaId: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("cuotas")
        .update({
          pagada: true,
          fecha_pago: new Date().toISOString(),
          metodo_pago: "efectivo",
        })
        .eq("id", cuotaId)

      if (error) throw error

      toast({
        title: "Cuota marcada como pagada",
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar la cuota",
        variant: "destructive",
      })
    }
  }

  if (cuotas.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No hay cuotas registradas</p>
      </Card>
    )
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Grupo Familiar</TableHead>
            <TableHead>Titular</TableHead>
            <TableHead>Período</TableHead>
            <TableHead>Monto</TableHead>
            <TableHead>Vencimiento</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cuotas.map((cuota) => (
            <TableRow key={cuota.id}>
              <TableCell className="font-medium">{cuota.grupos_familiares.nombre}</TableCell>
              <TableCell>{cuota.grupos_familiares.profiles.nombre_completo}</TableCell>
              <TableCell>
                {meses[cuota.mes - 1]} {cuota.anio}
              </TableCell>
              <TableCell>${cuota.monto}</TableCell>
              <TableCell>{new Date(cuota.fecha_vencimiento).toLocaleDateString()}</TableCell>
              <TableCell>
                <Badge variant={cuota.pagada ? "default" : "destructive"}>
                  {cuota.pagada ? "Pagada" : "Pendiente"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {!cuota.pagada && (
                  <Button variant="ghost" size="sm" onClick={() => handleMarcarPagada(cuota.id)}>
                    <Check className="h-4 w-4 mr-2" />
                    Marcar Pagada
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
