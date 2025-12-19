'use client'

import { useState, useTransition } from 'react'
import * as XLSX from 'xlsx'
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { FileDown, Loader2, User } from 'lucide-react'
import { updateMiembroStatus } from '@/app/admin/mi-disciplina/actions'
import { useToast } from '@/hooks/use-toast'

// VERSIÓN FINAL: La interfaz utiliza la nomenclatura correcta y consistente.
interface MiembroInfo {
  id: string;
  activa: boolean;
  nombre_miembro: string; // CORREGIDO
  dni_miembro: string | null;    // CORREGIDO
  nombre_titular: string;
}

interface MiDisciplinaTableProps {
  miembros: MiembroInfo[]
}

export function MiDisciplinaTable({ miembros }: MiDisciplinaTableProps) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [exporting, setExporting] = useState(false)

  const handleStatusChange = (inscripcionId: string, currentStatus: boolean) => {
    startTransition(async () => {
      const result = await updateMiembroStatus(inscripcionId, !currentStatus)
      if (result.error) {
        toast({ variant: "destructive", title: "Error", description: result.error })
      } else {
        toast({ title: "Estado Actualizado", description: `El miembro ha sido marcado como ${!currentStatus ? 'Activo' : 'Inactivo'}.` })
      }
    })
  }

  // VERSIÓN FINAL: La exportación utiliza los campos y etiquetas correctos.
  const handleExport = () => {
    setExporting(true)
    const dataToExport = miembros.map(m => ({
      'Nombre Miembro': m.nombre_miembro || 'N/A', // CORREGIDO
      'DNI Miembro': m.dni_miembro || 'N/A',       // CORREGIDO
      'Estado': m.activa ? 'Activo' : 'Inactivo',
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
        <h3 className="text-xl font-bold tracking-tight" style={{color: "#efb600"}}>Listado de Miembros</h3>
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
              <TableHead className="text-center">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {miembros.map((miembro) => (
              <TableRow key={miembro.id}>
                <TableCell>
                  {/* VERSIÓN FINAL: Se utilizan los campos de datos correctos. */}
                  <div className="font-medium">{miembro.nombre_miembro}</div>
                  <div className="text-sm text-gray-500">DNI: {miembro.dni_miembro || 'No especificado'}</div>
                </TableCell>
                <TableCell>
                  <div className="font-medium flex items-center">
                    <User className="h-3 w-3 mr-2 text-gray-400" />{miembro.nombre_titular || 'No disponible'}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex flex-col items-center justify-center space-y-1">
                    <Switch
                      checked={miembro.activa}
                      onCheckedChange={() => handleStatusChange(miembro.id, miembro.activa)}
                      disabled={isPending}
                      aria-readonly
                    />
                    <Badge variant={miembro.activa ? 'default' : 'outline'} className={miembro.activa ? 'bg-green-100 text-green-800' : 'text-gray-600'}>
                      {miembro.activa ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {isPending && <div className="absolute inset-0 bg-white/50 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-[#1e3a8a]" /></div>}
      </Card>
    </div>
  )
}
