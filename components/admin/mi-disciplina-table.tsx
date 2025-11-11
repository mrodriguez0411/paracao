"use client"

import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface InscripcionWithData {
  id: string
  fecha_inscripcion: string
  miembros_familia: {
    id: string
    nombre_completo: string
    dni: string | null
    parentesco: string | null
    grupos_familiares: {
      id: string
      nombre: string
      profiles: {
        nombre_completo: string
        email: string
      }
    }
  }
  disciplinas: {
    nombre: string
    cuota_deportiva: number
  }
}

interface MiDisciplinaTableProps {
  inscripciones: InscripcionWithData[]
}

export function MiDisciplinaTable({ inscripciones }: MiDisciplinaTableProps) {
  if (inscripciones.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No hay socios inscritos en esta disciplina</p>
      </Card>
    )
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Socio</TableHead>
            <TableHead>DNI</TableHead>
            <TableHead>Grupo Familiar</TableHead>
            <TableHead>Titular</TableHead>
            <TableHead>Email Titular</TableHead>
            <TableHead>Fecha Inscripción</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {inscripciones.map((inscripcion) => (
            <TableRow key={inscripcion.id}>
              <TableCell className="font-medium">{inscripcion.miembros_familia.nombre_completo}</TableCell>
              <TableCell>{inscripcion.miembros_familia.dni || "-"}</TableCell>
              <TableCell>{inscripcion.miembros_familia.grupos_familiares.nombre}</TableCell>
              <TableCell>{inscripcion.miembros_familia.grupos_familiares.profiles.nombre_completo}</TableCell>
              <TableCell>{inscripcion.miembros_familia.grupos_familiares.profiles.email}</TableCell>
              <TableCell>{new Date(inscripcion.fecha_inscripcion).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
