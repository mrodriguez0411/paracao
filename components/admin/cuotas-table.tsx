"use client"

import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useMemo, useState } from "react"

interface CuotaWithData {
  id: string
  tipo: "social" | "deportiva"
  mes: number
  anio: number
  monto: number
  fecha_vencimiento: string
  pagada: boolean
  fecha_pago: string | null
  metodo_pago: string | null
  grupos_familiares: {
    nombre: string
    profiles: {
      nombre_completo: string
    }
  }
  disciplinas: {
    nombre: string
  } | null
}

interface CuotasTableProps {
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

export function CuotasTable({ cuotas }: CuotasTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [filtroTipo, setFiltroTipo] = useState<string>("todos")

  const formatoARS = useMemo(
    () => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    []
  )

  const ahora = new Date()

  const lista = useMemo(() => {
    const base = Array.isArray(cuotas) ? cuotas : []
    if (!filtroTipo || filtroTipo === "todos") return base
    return base.filter((c) => c.tipo === (filtroTipo as any))
  }, [cuotas, filtroTipo])

  const totalesPorGrupo = useMemo(() => {
    const map = new Map<string, number>()
    for (const c of lista) {
      const key = c.grupos_familiares?.nombre || "(sin nombre)"
      map.set(key, Number((map.get(key) || 0) + Number(c.monto || 0)))
    }
    return map
  }, [lista])

  const totalGeneral = useMemo(() => {
    return lista.reduce((acc, c) => acc + Number(c.monto || 0), 0)
  }, [lista])

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
      <Card className="p-8 text-center bg-textura-amarilla">
        <p className="text-muted-foreground">No hay cuotas registradas</p>
      </Card>
    )
  }

  return (
    <Card className="border border-gray-100 shadow-sm rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-6 py-3 bg-white/70">
        <div className="text-sm text-gray-700">Filtrar por tipo</div>
        <div className="flex gap-2">
          <Button variant={filtroTipo === "todos" ? "default" : "outline"} size="sm" onClick={() => setFiltroTipo("todos")}
            className={filtroTipo === "todos" ? "bg-[#1e3a8a] text-white hover:bg-[#1e3a8a]/90" : ""}>
            Todos
          </Button>
          <Button variant={filtroTipo === "social" ? "default" : "outline"} size="sm" onClick={() => setFiltroTipo("social")}
            className={filtroTipo === "social" ? "bg-[#1e3a8a] text-white hover:bg-[#1e3a8a]/90" : ""}>
            Social
          </Button>
          <Button variant={filtroTipo === "deportiva" ? "default" : "outline"} size="sm" onClick={() => setFiltroTipo("deportiva")}
            className={filtroTipo === "deportiva" ? "bg-[#1e3a8a] text-white hover:bg-[#1e3a8a]/90" : ""}>
            Deportiva
          </Button>
        </div>
      </div>
      <div className="flex items-center justify-between px-6 py-2 bg-white/60 border-t border-gray-100">
        <div className="text-sm text-gray-600">Mostrando {lista.length} cuotas</div>
        <div className="text-sm font-semibold text-gray-800">
          Total general: {formatoARS.format(totalGeneral)}
        </div>
      </div>
      <Table>
        <TableHeader className="bg-white border-b border-gray-100">
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-gray-500 font-medium text-[11px] tracking-wider uppercase py-4 pl-6">Grupo Familiar</TableHead>
            <TableHead className="text-gray-500 font-medium text-[11px] tracking-wider uppercase py-4">Tipo</TableHead>
            <TableHead className="text-gray-500 font-medium text-[11px] tracking-wider uppercase py-4">Disciplina</TableHead>
            <TableHead className="text-gray-500 font-medium text-[11px] tracking-wider uppercase py-4">Período</TableHead>
            <TableHead className="text-gray-500 font-medium text-[11px] tracking-wider uppercase py-4">Monto</TableHead>
            <TableHead className="text-gray-500 font-medium text-[11px] tracking-wider uppercase py-4">Total Grupo</TableHead>
            <TableHead className="text-gray-500 font-medium text-[11px] tracking-wider uppercase py-4">Vencimiento</TableHead>
            <TableHead className="text-gray-500 font-medium text-[11px] tracking-wider uppercase py-4">Estado</TableHead>
            <TableHead className="text-right text-gray-500 font-medium text-[11px] tracking-wider uppercase py-4 pr-6">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lista.map((cuota) => {
            const vencida = !cuota.pagada && new Date(cuota.fecha_vencimiento) < ahora
            const key = cuota.grupos_familiares?.nombre || "(sin nombre)"
            return (
            <TableRow key={cuota.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0">
              <TableCell className="py-4 pl-6 font-medium text-gray-900">{cuota.grupos_familiares.nombre}</TableCell>
              <TableCell className="capitalize text-sm text-gray-700">{cuota.tipo}</TableCell>
              <TableCell className="text-sm text-gray-700">{cuota.disciplinas?.nombre || "-"}</TableCell>
              <TableCell className="text-sm text-gray-700">
                {meses[cuota.mes - 1]} {cuota.anio}
              </TableCell>
              <TableCell className="text-sm font-medium text-gray-900">{formatoARS.format(Number(cuota.monto || 0))}</TableCell>
              <TableCell className="text-sm font-medium text-gray-900">{formatoARS.format(Number(totalesPorGrupo.get(key) || 0))}</TableCell>
              <TableCell className="text-sm text-gray-700">{new Date(cuota.fecha_vencimiento).toLocaleDateString()}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Badge className={cuota.pagada ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-700"}>
                    {cuota.pagada ? "Pagada" : "Pendiente"}
                  </Badge>
                  {vencida && (
                    <Badge className="bg-red-100 text-red-700">Vencida</Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right pr-6">
                {!cuota.pagada && (
                  <Button variant="ghost" size="sm" onClick={() => handleMarcarPagada(cuota.id)} className="text-gray-500 hover:bg-blue-50 hover:text-blue-700 rounded-lg p-2 h-9">
                    <Check className="h-4 w-4 mr-2" />
                    Marcar Pagada
                  </Button>
                )}
              </TableCell>
            </TableRow>
          )})}
        </TableBody>
      </Table>
    </Card>
  )
}
