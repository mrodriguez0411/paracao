'use client'

import { useState } from 'react'
import * as XLSX from 'xlsx'
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileDown, Loader2, User } from 'lucide-react'

// VERSIÓN FINAL: La interfaz incluye el estado de la cuota.
interface MiembroInfo {
  id: string;
  activa: boolean;
  nombre_miembro: string;
  dni_miembro: string | null;
  nombre_titular: string;
  estado_cuota: string; // AÑADIDO
}

interface MiDisciplinaTableProps {
  miembros: MiembroInfo[]
}

export function MiDisciplinaTable({ miembros }: MiDisciplinaTableProps) {
  const [exporting, setExporting] = useState(false)

  // VERSIÓN FINAL: La exportación incluye el estado de la cuota.
  const handleExport = () => {
    setExporting(true)
    const dataToExport = miembros.map(m => ({
      'Nombre Miembro': m.nombre_miembro || 'N/A',
      'DNI Miembro': m.dni_miembro || 'N/A',
      'Estado Cuota': m.estado_cuota,
      'Estado Miembro': m.activa ? 'Activo' : 'Inactivo',
      'Nombre Titular': m.nombre_titular || 'N/A',
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Miembros');
    XLSX.writeFile(workbook, 'listado_miembros.xlsx');
    setExporting(false)
  };

  if (!miembros || miembros.length === 0) {
    return <Card className="p-8 text-center"><p>No hay miembros registrados en tu disciplina.</p></Card>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold tracking-tight text-[#efb600]">Listado de Miembros</h3>
        <Button onClick={handleExport} disabled={exporting}>
          {exporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
          Exportar a Excel
        </Button>
      </div>
      <Card className="border-none shadow-none">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Miembro</TableHead>
              <TableHead>Titular Responsable</TableHead>
              <TableHead className="text-center">Cuota Deportiva</TableHead>
              <TableHead className="text-center">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {miembros.map((miembro) => (
              <TableRow key={miembro.id}>
                <TableCell>
                  <div className="font-medium">{miembro.nombre_miembro}</div>
                  <div className="text-sm text-gray-500">DNI: {miembro.dni_miembro || 'No especificado'}</div>
                </TableCell>
                <TableCell>
                  <div className="font-medium flex items-center">
                    <User className="h-3 w-3 mr-2 text-gray-400" />{miembro.nombre_titular || 'No disponible'}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                   <Badge 
                     className={miembro.estado_cuota === 'Al día' 
                       ? 'bg-green-100 text-green-800' 
                       : 'bg-yellow-100 text-yellow-800'
                     }
                   >
                     {miembro.estado_cuota}
                   </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge 
                    variant={miembro.activa ? 'default' : 'outline'}
                    className={miembro.activa ? 'bg-green-100 text-green-800' : 'text-gray-600'}
                  >
                    {miembro.activa ? 'Activo' : 'Inactivo'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
