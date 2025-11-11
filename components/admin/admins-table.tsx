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
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No hay administradores de disciplina registrados</p>
      </Card>
    )
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Disciplina Asignada</TableHead>
            <TableHead>Fecha Registro</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {admins.map((admin) => (
            <TableRow key={admin.id}>
              <TableCell className="font-medium">{admin.nombre_completo}</TableCell>
              <TableCell>{admin.email}</TableCell>
              <TableCell>{admin.telefono || "-"}</TableCell>
              <TableCell>
                {admin.disciplinas && admin.disciplinas.length > 0 ? (
                  <Badge>{admin.disciplinas[0].nombre}</Badge>
                ) : (
                  <span className="text-muted-foreground">Sin asignar</span>
                )}
              </TableCell>
              <TableCell>{new Date(admin.created_at).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
