import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface CuotaData {
  id: string
  tipo: "social" | "deportiva"
  mes: number
  anio: number
  monto: number
  fecha_vencimiento: string
  pagada: boolean
  fecha_pago: string | null
  metodo_pago: string | null
  disciplinas: {
    nombre: string
  } | null
}

interface CuotasSocioTableProps {
  cuotas: CuotaData[]
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

export function CuotasSocioTable({ cuotas }: CuotasSocioTableProps) {
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
            <TableHead>Tipo</TableHead>
            <TableHead>Disciplina</TableHead>
            <TableHead>Período</TableHead>
            <TableHead>Monto</TableHead>
            <TableHead>Vencimiento</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha de Pago</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cuotas.map((cuota) => (
            <TableRow key={cuota.id}>
              <TableCell className="capitalize">{cuota.tipo}</TableCell>
              <TableCell>{cuota.disciplinas?.nombre || "-"}</TableCell>
              <TableCell>
                {meses[cuota.mes - 1]} {cuota.anio}
              </TableCell>
              <TableCell className="font-medium">${cuota.monto}</TableCell>
              <TableCell>{new Date(cuota.fecha_vencimiento).toLocaleDateString()}</TableCell>
              <TableCell>
                <Badge variant={cuota.pagada ? "default" : "destructive"}>
                  {cuota.pagada ? "Pagada" : "Pendiente"}
                </Badge>
              </TableCell>
              <TableCell>{cuota.fecha_pago ? new Date(cuota.fecha_pago).toLocaleDateString() : "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
