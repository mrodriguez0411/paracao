'use client'

import { useState, useTransition, useMemo, Fragment } from "react"
import * as XLSX from 'xlsx'
import { getHistorialCuotasDisciplina, type HistorialCuota } from "@/app/admin/mi-disciplina/actions"

import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Loader2, ChevronDown, ChevronRight, FileDown, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// --- Tipos de Datos ---
type ActivityData = {
  actividad_id: string;
  actividad_nombre: string;
  miembros: HistorialCuota[];
}

// --- Propiedades del Componente ---
interface ClientProps {
  initialData: HistorialCuota[];
  initialMonth: number;
  initialYear: number;
}

// --- Componente para Fila de Actividad Desplegable ---
function ActivityRow({ activity, searchTerm }: { activity: ActivityData; searchTerm: string }) {
  const [isOpen, setIsOpen] = useState(false);

  const filteredMiembros = useMemo(() => {
    return activity.miembros.filter(m => 
      m.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [activity.miembros, searchTerm]);

  if (filteredMiembros.length === 0) return null;

  const totalPagado = filteredMiembros.reduce((acc, m) => m.estado_pago === 'Pagada' ? acc + 1 : acc, 0);
  const porcentajePagado = (totalPagado / filteredMiembros.length) * 100;

  return (
    <Fragment>
      <TableRow onClick={() => setIsOpen(!isOpen)} className="cursor-pointer hover:bg-gray-50">
        <TableCell className="font-medium">
          <div className="flex items-center gap-2">
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            {activity.actividad_nombre}
          </div>
        </TableCell>
        <TableCell className="text-center">{filteredMiembros.length}</TableCell>
        <TableCell className="text-center">{totalPagado} de {filteredMiembros.length} ({porcentajePagado.toFixed(0)}%)</TableCell>
        <TableCell className="text-right"></TableCell>
      </TableRow>

      {isOpen && filteredMiembros.map(miembro => (
        <TableRow key={miembro.miembro_id} className="bg-white">
          <TableCell className="pl-12 text-sm">{miembro.nombre_completo}</TableCell>
          <TableCell className="text-center">-</TableCell> 
          <TableCell className="text-center">
            <Badge className={miembro.estado_pago === 'Pagada' ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
              {miembro.estado_pago}
            </Badge>
          </TableCell>
          <TableCell className="text-right text-xs text-gray-500">
            {miembro.estado_pago === 'Pagada' && miembro.fecha_pago 
              ? `Pagado el ${new Date(miembro.fecha_pago).toLocaleDateString()}`
              : ''}
          </TableCell>
        </TableRow>
      ))}
    </Fragment>
  )
}

// --- Componente Principal del Cliente ---
export function HistorialCuotasDisciplinaClient({ initialData, initialMonth, initialYear }: ClientProps) {
  const { toast } = useToast();
  const [mes, setMes] = useState<string>(String(initialMonth));
  const [anio, setAnio] = useState<string>(String(initialYear));
  const [searchTerm, setSearchTerm] = useState("");
  const [historial, setHistorial] = useState<HistorialCuota[]>(initialData);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, startSearchTransition] = useTransition();

  const handleSearch = () => {
    setError(null);
    startSearchTransition(async () => {
      const result = await getHistorialCuotasDisciplina(parseInt(mes), parseInt(anio));
      if (result.success) {
        setHistorial(result.data || []);
      } else {
        setError(result.message);
        setHistorial([]); 
      }
    });
  };

  const groupedData = useMemo<ActivityData[]>(() => {
    const map = new Map<string, ActivityData>();
    historial.forEach(item => {
      if (!map.has(item.actividad_id)) {
        map.set(item.actividad_id, { 
          actividad_id: item.actividad_id,
          actividad_nombre: item.actividad_nombre, 
          miembros: [] 
        });
      }
      map.get(item.actividad_id)!.miembros.push(item);
    });
    return Array.from(map.values()).sort((a,b) => a.actividad_nombre.localeCompare(b.actividad_nombre));
  }, [historial]);

  const handleExport = () => {
    if (historial.length === 0) {
      toast({ title: "No hay datos para exportar", variant: "destructive" });
      return;
    }
    const dataToExport = historial.map(h => ({
      'Actividad': h.actividad_nombre,
      'Miembro': h.nombre_completo,
      'Estado del Pago': h.estado_pago,
      'Fecha de Pago': h.fecha_pago ? new Date(h.fecha_pago).toLocaleDateString() : 'N/A',
      'Monto': h.monto_pagado,
      'Mes': mes,
      'Año': anio,
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Historial de Cuotas');
    XLSX.writeFile(workbook, `historial_disciplina_${mes}_${anio}.xlsx`);
  };

  const anios = Array.from({ length: 10 }, (_, i) => String(new Date().getFullYear() - i));

  return (
    <div className="space-y-6">
      <Card className="p-4 bg-white/80 backdrop-blur border-gray-200/80 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
          <Select value={mes} onValueChange={setMes}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>
            {Array.from({length: 12}, (_,i) => <SelectItem key={i+1} value={String(i+1)}>{new Date(0,i).toLocaleString('es-ES', {month: 'long'})}</SelectItem>)}
          </SelectContent></Select>
          <Select value={anio} onValueChange={setAnio}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{anios.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent></Select>
          <Button onClick={handleSearch} disabled={isSearching} className="w-full bg-blue-600 text-white hover:bg-blue-700">
            {isSearching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}Buscar
          </Button>
          <Button onClick={handleExport} className="w-full bg-green-600 text-white hover:bg-green-700">
            <FileDown className="mr-2 h-4 w-4" /> Exportar
          </Button>
        </div>
      </Card>

      {error && (
        <Card className="p-4 text-center text-red-600 bg-red-50 border-red-200">
            <div className="flex items-center justify-center gap-2">
                <AlertTriangle className="h-5 w-5"/>
                <p className="font-semibold">{error}</p>
            </div>
        </Card>
      )}

      <Card className="bg-white/80 backdrop-blur border-gray-200/80 shadow-sm">
        <div className="p-4 border-b">
          <Input placeholder="Buscar por nombre de miembro..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Actividad</TableHead>
                <TableHead className="text-center">Inscriptos</TableHead>
                <TableHead className="text-center">Estado de Pagos</TableHead>
                <TableHead className="text-right">Detalle</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isSearching ? (
                <TableRow><TableCell colSpan={4} className="text-center py-12"><Loader2 className="mx-auto h-8 w-8 animate-spin text-gray-500"/></TableCell></TableRow>
              ) : groupedData.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-12 text-gray-500">No se encontraron datos para el período seleccionado.</TableCell></TableRow>
              ) : (
                groupedData.map(activity => (
                  <ActivityRow key={activity.actividad_id} activity={activity} searchTerm={searchTerm} />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
