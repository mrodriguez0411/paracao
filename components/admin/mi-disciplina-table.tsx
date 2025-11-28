"use client"

import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Miembro {
  id: string
  nombre_completo: string
  email: string
  telefono: string | null
  dni: string | null
  created_at: string
}

interface MiDisciplinaTableProps {
  miembros: Miembro[]
}

export function MiDisciplinaTable({ miembros }: MiDisciplinaTableProps) {
  if (miembros.length === 0) {
    return (
      <Card className="p-8 text-center bg-textura-amarilla">
        <p className="text-muted-foreground">No hay miembros registrados en tu disciplina.</p>
      </Card>
    )
  }

  return (
    <Card className="border border-gray-100 shadow-sm rounded-xl overflow-hidden">
      <Table>
        <TableHeader className="bg-white border-b border-gray-100">
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-gray-500 font-medium text-[11px] tracking-wider uppercase py-4 pl-6">Nombre Completo</TableHead>
            <TableHead className="text-gray-500 font-medium text-[11px] tracking-wider uppercase py-4">Email</TableHead>
            <TableHead className="text-gray-500 font-medium text-[11px] tracking-wider uppercase py-4">Teléfono</TableHead>
            <TableHead className="text-gray-500 font-medium text-[11px] tracking-wider uppercase py-4">DNI</TableHead>
            <TableHead className="text-gray-500 font-medium text-[11px] tracking-wider uppercase py-4">Fecha de Registro</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {miembros.map((miembro) => (
            <TableRow key={miembro.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0">
              <TableCell className="py-4 pl-6 font-medium text-gray-900">{miembro.nombre_completo}</TableCell>
              <TableCell className="text-sm text-gray-700">{miembro.email}</TableCell>
              <TableCell className="text-sm text-gray-700">{miembro.telefono || "-"}</TableCell>
              <TableCell className="text-sm text-gray-700">{miembro.dni || "-"}</TableCell>
              <TableCell className="text-sm text-gray-700">{new Date(miembro.created_at).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
