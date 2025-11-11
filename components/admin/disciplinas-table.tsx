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
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No hay disciplinas registradas</p>
      </Card>
    )
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Disciplina</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Cuota Deportiva</TableHead>
            <TableHead>Administrador</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {disciplinas.map((disciplina) => (
            <TableRow key={disciplina.id}>
              <TableCell className="font-medium">{disciplina.nombre}</TableCell>
              <TableCell className="max-w-xs truncate">{disciplina.descripcion || "-"}</TableCell>
              <TableCell>${disciplina.cuota_deportiva}</TableCell>
              <TableCell>{disciplina.admin?.nombre_completo || "Sin asignar"}</TableCell>
              <TableCell>
                <Badge variant={disciplina.activa ? "default" : "secondary"}>
                  {disciplina.activa ? "Activa" : "Inactiva"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" asChild>
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
