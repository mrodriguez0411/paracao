'use client'

import { useState, useMemo, useEffect } from 'react'
import * as XLSX from 'xlsx'
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileDown, Loader2, User } from 'lucide-react'
import { getMiembrosPorDisciplina } from '@/app/admin/mi-disciplina/actions'
import { toast } from 'sonner'

// VERSIÓN 22.0: Se revierte la funcionalidad de pago. La tabla es solo de consulta.
interface MiembroInfo {
  id: string;
  activa: boolean;
  nombre_miembro: string;
  dni_miembro: string | null;
  nombre_titular: string;
  estado_cuota: string;
  monto_cuota: number | null;
  mes_cuota: number | null;
  anio_cuota: number | null;
}

interface MiDisciplinaTableProps {
  miembros: MiembroInfo[]
}

export function MiDisciplinaTable({ miembros: initialMiembros }: MiDisciplinaTableProps) {
  const [exporting, setExporting] = useState(false);
  const [miembros, setMiembros] = useState<MiembroInfo[]>(initialMiembros);
  const [loading, setLoading] = useState(true);

  const [selectedMonth, setSelectedMonth] = useState<string>((new Date().getMonth() + 1).toString());
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - i);
  }, []);

  const months = useMemo(() => [
    { value: '1', label: 'Enero' }, { value: '2', label: 'Febrero' }, { value: '3', label: 'Marzo' },
    { value: '4', label: 'Abril' }, { value: '5', label: 'Mayo' }, { value: '6', label: 'Junio' },
    { value: '7', label: 'Julio' }, { value: '8', label: 'Agosto' }, { value: '9', label: 'Septiembre' },
    { value: '10', label: 'Octubre' }, { value: '11', label: 'Noviembre' }, { value: '12', label: 'Diciembre' },
  ], []);

  useEffect(() => {
    const fetchMiembros = async () => {
      setLoading(true);
      const month = parseInt(selectedMonth, 10);
      const year = parseInt(selectedYear, 10);

      if (isNaN(month) || isNaN(year)) {
        setLoading(false);
        return;
      }

      const { data, error } = await getMiembrosPorDisciplina(year, month);
      if (error) {
        toast.error("Error al cargar los miembros.");
        setMiembros([]);
      } else {
        setMiembros(data);
      }
      setLoading(false);
    };

    fetchMiembros();
  }, [selectedMonth, selectedYear]);

  const clearFilters = () => {
    setSelectedMonth((new Date().getMonth() + 1).toString());
    setSelectedYear(new Date().getFullYear().toString());
  };

  const handleExport = () => {
    setExporting(true);
    const monthLabel = months.find(m => m.value === selectedMonth)?.label || 'Mes';
    const dataToExport = miembros.map(m => ({
      'Nombre Miembro': m.nombre_miembro || 'N/A',
      'DNI Miembro': m.dni_miembro || 'N/A',
      'Titular Responsable': m.nombre_titular || 'N/A',
      'Cuota Deportiva': m.monto_cuota != null ? `$${m.monto_cuota}` : 'N/A',
      'Estado Cuota': m.estado_cuota,
      'Estado Miembro': m.activa ? 'Activo' : 'Inactivo',
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, monthLabel);
    XLSX.writeFile(workbook, `listado_miembros_${monthLabel}_${selectedYear}.xlsx`);
    setExporting(false);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold mb-4" style={{ color: '#efb600' }}>Inscriptos a Disciplinas</h1>
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="border border-gray-300 rounded-md p-2" style={{ color: '#1e3a8a' }}>
          {months.map(month => <option key={month.value} value={month.value}>{month.label}</option>)}
        </select>
        <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="border border-gray-300 rounded-md p-2" style={{ color: '#1e3a8a' }}>
          {years.map(year => <option key={year} value={year}>{year}</option>)}
        </select>
        <Button onClick={clearFilters} variant="outline" style={{ backgroundColor: '#efb600' }}>
          Mes Actual
        </Button>
        <div className="flex-grow"></div>
        <Button onClick={handleExport} disabled={exporting || loading}>
          {exporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
          Exportar a Excel
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin text-gray-500" /></div>
      ) : (
        <>
          <h3 className="text-xl font-bold tracking-tight" style={{ color: '#efb600' }}>Listado de Miembros</h3>
          {!miembros || miembros.length === 0 ? (
            <Card className="p-8 text-center"><p>No se encontraron miembros para el período seleccionado.</p></Card>
          ) : (
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
                        <div className='flex flex-col items-center justify-center'>
                          <span className='font-semibold'>{miembro.monto_cuota != null ? `$${miembro.monto_cuota}` : 'N/A'}</span>
                          <Badge className={miembro.estado_cuota === 'Al día' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            {miembro.estado_cuota}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={miembro.activa ? 'default' : 'outline'} className={miembro.activa ? 'bg-green-100 text-green-800' : 'text-gray-600'}>
                          {miembro.activa ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
