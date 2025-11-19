"use client"

import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

interface DisciplinaWithAdmin {
  id: string
  nombre: string
  descripcion: string | null
  cuota_deportiva: number
  activa: boolean
  admin: {
    nombre_completo: string
  } | null
}

interface DisciplinasTableProps {
  disciplinas: DisciplinaWithAdmin[]
}

export function DisciplinasTable({ disciplinas }: DisciplinasTableProps) {
  if (disciplinas.length === 0) {
    return (
      <Card className="p-8 text-center bg-textura-amarilla">
        <p className="text-muted-foreground">No hay disciplinas registradas</p>
      </Card>
    )
  }

  return (
    <Card className="border border-gray-100 shadow-sm rounded-xl overflow-hidden">
      <Table>
        <TableHeader className="bg-white border-b border-gray-100">
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-gray-500 font-medium text-[11px] tracking-wider uppercase py-4 pl-6">Disciplina</TableHead>
            <TableHead className="text-gray-500 font-medium text-[11px] tracking-wider uppercase py-4">Descripción</TableHead>
            <TableHead className="text-gray-500 font-medium text-[11px] tracking-wider uppercase py-4">Cuota Deportiva</TableHead>
            <TableHead className="text-gray-500 font-medium text-[11px] tracking-wider uppercase py-4">Administrador</TableHead>
            <TableHead className="text-gray-500 font-medium text-[11px] tracking-wider uppercase py-4">Estado</TableHead>
            <TableHead className="text-right text-gray-500 font-medium text-[11px] tracking-wider uppercase py-4 pr-6">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {disciplinas.map((disciplina) => (
            <TableRow key={disciplina.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0">
              <TableCell className="py-4 pl-6 font-medium text-gray-900">{disciplina.nombre}</TableCell>
              <TableCell className="max-w-xs truncate text-sm text-gray-700">{disciplina.descripcion || "-"}</TableCell>
              <TableCell className="text-sm font-medium text-gray-900">${disciplina.cuota_deportiva}</TableCell>
              <TableCell className="text-sm text-gray-700">{disciplina.admin?.nombre_completo || "Sin asignar"}</TableCell>
              <TableCell>
                <Badge className={disciplina.activa ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-700"}>
                  {disciplina.activa ? "Activa" : "Inactiva"}
                </Badge>
              </TableCell>
              <TableCell className="text-right pr-6">
                <Button variant="ghost" size="sm" asChild className="text-gray-500 hover:bg-blue-50 hover:text-blue-700 rounded-lg p-2 h-9 w-9">
                  <Link href={`/admin/disciplinas/${disciplina.id}/editar`}>
                    <Edit className="h-4 w-4" />
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
