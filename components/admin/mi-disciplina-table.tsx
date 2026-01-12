'use client'

import { useState, useMemo } from 'react'
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
  fecha_inscripcion: string;
}

interface MiDisciplinaTableProps {
  miembros: MiembroInfo[]
}

export function MiDisciplinaTable({ miembros }: MiDisciplinaTableProps) {
  const [exporting, setExporting] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');

  // VERSIÓN FINAL: La exportación incluye el estado de la cuota.
    const years = useMemo(() => {
        const allYears = miembros
      .map(miembro => new Date(miembro.fecha_inscripcion).getFullYear())
      .filter(year => !isNaN(year));
    return Array.from(new Set(allYears)).sort((a, b) => b - a);
  }, [miembros]);

  const months = [
      { value: '0', label: 'Enero' },
      { value: '1', label: 'Febrero' },
      { value: '2', label: 'Marzo' },
      { value: '3', label: 'Abril' },
      { value: '4', label: 'Mayo' },
      { value: '5', label: 'Junio' },
      { value: '6', label: 'Julio' },
      { value: '7', label: 'Agosto' },
      { value: '8', label: 'Septiembre' },
      { value: '9', label: 'Octubre' },
      { value: '10', label: 'Noviembre' },
      { value: '11', label: 'Diciembre' },
  ];

  const filteredMiembros = useMemo(() => {
      if (!selectedMonth && !selectedYear) {
          return miembros;
      }
      return miembros.filter(miembro => {
          const date = new Date(miembro.fecha_inscripcion);
          if (isNaN(date.getTime())) return false; // Skips invalid dates

          const month = date.getMonth().toString();
          const year = date.getFullYear().toString();

          const monthMatch = selectedMonth ? month === selectedMonth : true;
          const yearMatch = selectedYear ? year === selectedYear : true;

          return monthMatch && yearMatch;
      });
  }, [miembros, selectedMonth, selectedYear]);

  const clearFilters = () => {
      setSelectedMonth('');
      setSelectedYear('');
  };

  const handleExport = () => {
    setExporting(true)
    const dataToExport = filteredMiembros.map(m => ({
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

  if (!filteredMiembros || filteredMiembros.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold mb-4" style={{ color: '#efb600' }}>Inscriptos a Disciplinas</h1>
        <div className="flex gap-4 mb-4">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border border-gray-300 rounded-md p-2"
            style={{ color: '#1e3a8a' }}
          >
            <option value="">Seleccionar Mes</option>
            {months.map(month => (
              <option key={month.value} value={month.value}>{month.label}</option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="border border-gray-300 rounded-md p-2"
            style={{ color: '#1e3a8a' }}
          >
            <option value="">Seleccionar Año</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <Button onClick={clearFilters} variant="outline" style={{ backgroundColor: '#efb600' }}>
            Limpiar Filtros
          </Button>
        </div>
        <Card className="p-8 text-center">
          <p>No se encontraron miembros que coincidan con los filtros seleccionados.</p>
        </Card>
      </div>
    );
  }

  return (
        <div className="space-y-4">
      <h1 className="text-2xl font-semibold mb-4" style={{color: '#efb600'}}>Inscriptos a Disciplinas</h1>
      <div className="flex gap-4 mb-4">
          <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border border-gray-300 rounded-md p-2"
              style={{color: '#1e3a8a'}}
          >
              <option value="">Seleccionar Mes</option>
              {months.map(month => (
                  <option key={month.value} value={month.value}>{month.label}</option>
              ))}
          </select>
          <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="border border-gray-300 rounded-md p-2"
              style={{color: '#1e3a8a'}}
          >
              <option value="">Seleccionar Año</option>
              {years.map(year => (
                  <option key={year} value={year}>{year}</option>
              ))}
          </select>
          <Button onClick={clearFilters} variant="outline"
          style={{backgroundColor: '#efb600'}}
          >Limpiar Filtros</Button>
      </div>
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold tracking-tight" style={{color: '#efb600'}}>Listado de Miembros</h3>
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
            {filteredMiembros.map((miembro) => (
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
