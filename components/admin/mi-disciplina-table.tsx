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
      <Card className="p-8 text-center bg-textura-amarilla">
        <p className="text-muted-foreground">No hay socios inscritos en esta disciplina</p>
      </Card>
    )
  }

  return (
    <Card className="border border-gray-100 shadow-sm rounded-xl overflow-hidden">
      <Table>
        <TableHeader className="bg-white border-b border-gray-100">
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-gray-500 font-medium text-[11px] tracking-wider uppercase py-4 pl-6">Socio</TableHead>
            <TableHead className="text-gray-500 font-medium text-[11px] tracking-wider uppercase py-4">DNI</TableHead>
            <TableHead className="text-gray-500 font-medium text-[11px] tracking-wider uppercase py-4">Grupo Familiar</TableHead>
            <TableHead className="text-gray-500 font-medium text-[11px] tracking-wider uppercase py-4">Titular</TableHead>
            <TableHead className="text-gray-500 font-medium text-[11px] tracking-wider uppercase py-4">Email Titular</TableHead>
            <TableHead className="text-gray-500 font-medium text-[11px] tracking-wider uppercase py-4">Fecha Inscripción</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {inscripciones.map((inscripcion) => (
            <TableRow key={inscripcion.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0">
              <TableCell className="py-4 pl-6 font-medium text-gray-900">{inscripcion.miembros_familia.nombre_completo}</TableCell>
              <TableCell className="text-sm text-gray-700">{inscripcion.miembros_familia.dni || "-"}</TableCell>
              <TableCell className="text-sm text-gray-700">{inscripcion.miembros_familia.grupos_familiares.nombre}</TableCell>
              <TableCell className="text-sm text-gray-700">{inscripcion.miembros_familia.grupos_familiares.profiles.nombre_completo}</TableCell>
              <TableCell className="text-sm text-gray-700">{inscripcion.miembros_familia.grupos_familiares.profiles.email}</TableCell>
              <TableCell className="text-sm text-gray-700">{new Date(inscripcion.fecha_inscripcion).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
