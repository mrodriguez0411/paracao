
"use client"

import * as XLSX from 'xlsx'; // 1. Importar la librería
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button" // 2. Importar el componente Button
import { FileDown } from 'lucide-react'; // Ícono para el botón

// Interfaz sin cambios
interface Miembro {
  id: string
  nombre_completo: string
  dni: string | null
  estado_cuota: string
  fecha_inscripcion: string
}

interface MiDisciplinaTableProps {
  miembros: Miembro[]
}

export function MiDisciplinaTable({ miembros }: MiDisciplinaTableProps) {
  // 3. Función para manejar la exportación
  const handleExport = () => {
    // Formatear los datos para que las columnas tengan nombres amigables
    const dataToExport = miembros.map(miembro => ({
      'Nombre Completo': miembro.nombre_completo,
      'DNI': miembro.dni || 'N/A',
      'Fecha de Inscripción': new Date(miembro.fecha_inscripcion).toLocaleDateString(),
      'Estado Cuota (Mes Actual)': miembro.estado_cuota,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Miembros'); // 'Miembros' es el nombre de la hoja
    
    // Generar el archivo y descargarlo
    XLSX.writeFile(workbook, 'listado_miembros_disciplina.xlsx');
  };

  if (!miembros || miembros.length === 0) {
    return (
      <Card className="p-8 text-center bg-textura-amarilla">
        <p className="text-muted-foreground">No hay miembros registrados en tu disciplina.</p>
      </Card>
    )
  }

  return (
    // 4. Contenedor principal con título y botón
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold tracking-tight" style={{color: '#efb600'}}>Listado de Miembros</h3>
          <p className="text-sm text-muted-foreground" style={{color: '#efb600'}}>
            A continuación se detallan todos los miembros inscriptos.
          </p>
        </div>
        <Button onClick={handleExport}>
          <FileDown className="mr-2 h-4 w-4" />
          Exportar a Excel
        </Button>
      </div>

      <Card className="border border-gray-100 shadow-sm rounded-xl overflow-hidden">
        <Table>
          <TableHeader className="bg-white border-b border-gray-100">
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-gray-500 font-medium text-[11px] tracking-wider uppercase py-4 pl-6">Nombre Completo</TableHead>
              <TableHead className="text-gray-500 font-medium text-[11px] tracking-wider uppercase py-4">DNI</TableHead>
              <TableHead className="text-gray-500 font-medium text-[11px] tracking-wider uppercase py-4">Fecha de Inscripción</TableHead>
              <TableHead className="text-gray-500 font-medium text-[11px] tracking-wider uppercase py-4 text-right pr-6">Estado Cuota</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {miembros.map((miembro) => (
              <TableRow key={miembro.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0">
                <TableCell className="py-4 pl-6 font-medium text-gray-900">{miembro.nombre_completo}</TableCell>
                <TableCell className="text-sm text-gray-700">{miembro.dni || "-"}</TableCell>
                <TableCell className="text-sm text-gray-700">{new Date(miembro.fecha_inscripcion).toLocaleDateString()}</TableCell>
                <TableCell className="text-sm text-gray-700 text-right pr-6">
                  <Badge
                    className={`font-semibold ${
                      miembro.estado_cuota === 'Al día'
                        ? 'bg-green-100 text-green-800 hover:bg-green-100'
                        : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                    }`}
                  >
                    {miembro.estado_cuota}
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
