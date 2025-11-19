"use client"

import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface AdminWithDisciplina {
  id: string
  nombre_completo: string
  email: string
  telefono: string | null
  created_at: string
  disciplinas: { nombre: string }[]
}

interface AdminsTableProps {
  admins: AdminWithDisciplina[]
}

export function AdminsTable({ admins }: AdminsTableProps) {
  if (admins.length === 0) {
    return (
      <Card className="p-8 text-center bg-textura-amarilla">
        <p className="text-muted-foreground">No hay administradores de disciplina registrados</p>
      </Card>
    )
  }

  return (
    <Card className="border border-gray-100 shadow-sm rounded-xl overflow-hidden">
      <Table>
        <TableHeader className="bg-white border-b border-gray-100">
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-gray-500 font-medium text-[11px] tracking-wider uppercase py-4 pl-6">Nombre</TableHead>
            <TableHead className="text-gray-500 font-medium text-[11px] tracking-wider uppercase py-4">Email</TableHead>
            <TableHead className="text-gray-500 font-medium text-[11px] tracking-wider uppercase py-4">Teléfono</TableHead>
            <TableHead className="text-gray-500 font-medium text-[11px] tracking-wider uppercase py-4">Disciplina Asignada</TableHead>
            <TableHead className="text-gray-500 font-medium text-[11px] tracking-wider uppercase py-4">Fecha Registro</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {admins.map((admin) => (
            <TableRow key={admin.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0">
              <TableCell className="py-4 pl-6 font-medium text-gray-900">{admin.nombre_completo}</TableCell>
              <TableCell className="text-sm text-gray-700">{admin.email}</TableCell>
              <TableCell className="text-sm text-gray-700">{admin.telefono || "-"}</TableCell>
              <TableCell>
                {admin.disciplinas && admin.disciplinas.length > 0 ? (
                  <Badge className="bg-blue-100 text-blue-800">{admin.disciplinas[0].nombre}</Badge>
                ) : (
                  <span className="text-muted-foreground">Sin asignar</span>
                )}
              </TableCell>
              <TableCell className="text-sm text-gray-700">{new Date(admin.created_at).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
