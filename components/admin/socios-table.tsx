"use client"

import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Eye, Edit } from "lucide-react"
import Link from "next/link"

interface GrupoWithData {
  id: string
  nombre: string
  cuota_social: number
  created_at: string
  profiles: {
    nombre_completo: string
    email: string
    dni: string
  }
  miembros_familia: { count: number }[]
}

interface SociosTableProps {
  grupos: GrupoWithData[]
}

export function SociosTable({ grupos }: SociosTableProps) {
  if (grupos.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No hay socios registrados</p>
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
            <TableHead>DNI</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Miembros</TableHead>
            <TableHead>Cuota Social</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {grupos.map((grupo) => (
            <TableRow key={grupo.id}>
              <TableCell className="font-medium">{grupo.nombre}</TableCell>
              <TableCell>{grupo.profiles?.nombre_completo}</TableCell>
              <TableCell className="font-mono font-semibold">{grupo.profiles?.dni}</TableCell>
              <TableCell>{grupo.profiles?.email}</TableCell>
              <TableCell>{grupo.miembros_familia?.length || 0}</TableCell>
              <TableCell>${grupo.cuota_social}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/admin/socios/${grupo.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/admin/socios/${grupo.id}/editar`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
