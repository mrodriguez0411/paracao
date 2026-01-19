"use client"

import { useState, useTransition, useMemo, Fragment } from "react"
import * as XLSX from 'xlsx';
import { getCuotas, registrarPagoManual, type GrupoConCuotas, type CuotaDetalle } from "@/app/admin/historial-cuotas/actions"

import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Loader2, CheckCircle, ChevronDown, ChevronRight, FileDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type StatusFilter = "todas" | "pagada" | "pendiente" | "vencida"

// --- Componente para una Fila de Grupo Desplegable ---
function GrupoRow({ grupo, onPay, isPaying, statusFilter, searchTerm }: { 
  grupo: GrupoConCuotas, 
  onPay: (cuotaId: string) => void,
  isPaying: boolean,
  statusFilter: StatusFilter,
  searchTerm: string
}) {
  const [isOpen, setIsOpen] = useState(false)

  const getStatus = (cuota: CuotaDetalle): { text: string; className: string } => {
    if (cuota.pagada) return { text: "Pagada", className: "bg-green-100 text-green-800" }
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0)
    if (new Date(cuota.fecha_vencimiento) < hoy) return { text: "Vencida", className: "bg-red-100 text-red-800" }
    return { text: "Pendiente", className: "bg-yellow-100 text-yellow-800" }
  }

  const filteredCuotas = useMemo(() => {
    return grupo.cuotas.filter(cuota => {
      const status = getStatus(cuota).text.toLowerCase();
      const search = searchTerm.toLowerCase();

      const matchesStatus = statusFilter === "todas" || 
                            (statusFilter === "pagada" && status === "pagada") ||
                            (statusFilter === "pendiente" && status === "pendiente") ||
                            (statusFilter === "vencida" && status === "vencida");

      const matchesSearch = !search || 
                            grupo.grupo_nombre.toLowerCase().includes(search) || 
                            cuota.detalle.toLowerCase().includes(search);

      return matchesStatus && matchesSearch;
    })
  }, [grupo.cuotas, statusFilter, searchTerm]);

  if (filteredCuotas.length === 0) return null;

  const totalMonto = filteredCuotas.reduce((acc, cuota) => acc + cuota.monto, 0);
  const estadoGeneral = filteredCuotas.every(c => c.pagada) ? "Pagado" : "Pendiente";

  const mesesUnicos = [...new Set(filteredCuotas.map(c => c.mes))];
  const mesDisplay = mesesUnicos.length === 1 
      ? new Date(0, mesesUnicos[0] - 1).toLocaleString('es-ES', { month: 'long' })
      : 'Varios meses';

  return (
    <Fragment>
      <TableRow onClick={() => setIsOpen(!isOpen)} className="cursor-pointer hover:bg-gray-50">
        <TableCell className="font-medium text-black">
          <div className="flex items-center gap-2">
            {isOpen ? <ChevronDown className="h-4 w-4"/> : <ChevronRight className="h-4 w-4"/>}
            {grupo.grupo_nombre}
          </div>
        </TableCell>
        <TableCell className="text-black">({filteredCuotas.length} conceptos)</TableCell>
        <TableCell className="text-right font-semibold text-black">${totalMonto.toFixed(2)}</TableCell>
        <TableCell className="text-center text-black capitalize">{mesDisplay}</TableCell>
        <TableCell className="text-center">
          <Badge variant={estadoGeneral === "Pagado" ? "default" : "outline"} className={estadoGeneral === "Pagado" ? "bg-green-500" : ""}>{estadoGeneral}</Badge>
        </TableCell>
        <TableCell className="text-right"></TableCell>
      </TableRow>

      {isOpen && filteredCuotas.map(cuota => {
        const status = getStatus(cuota);
        const mesCuota = new Date(0, cuota.mes - 1).toLocaleString('es-ES', { month: 'long' });
        return (
          <TableRow key={cuota.id} className="bg-white">
            <TableCell className="pl-12 text-sm text-black">{cuota.detalle}</TableCell>
            <TableCell></TableCell> 
            <TableCell className="text-right text-black">${cuota.monto.toFixed(2)}</TableCell>
            <TableCell className="text-center text-sm text-black capitalize">{mesCuota}</TableCell>
            <TableCell className="text-center"><Badge className={status.className}>{status.text}</Badge></TableCell>
            <TableCell className="text-right">
              {!cuota.pagada && (
                <Button size="sm" variant="outline" onClick={() => onPay(cuota.id)} disabled={isPaying} className="text-green-600 border-green-400 hover:bg-green-50 hover:text-green-700">
                  {isPaying ? <Loader2 className="h-4 w-4 animate-spin"/> : <CheckCircle className="h-4 w-4"/>}
                </Button>
              )}
            </TableCell>
          </TableRow>
        )
      })}
    </Fragment>
  )
}

// --- Componente Principal ---
export function HistorialCuotasClient() {
  const { toast } = useToast();
  const [mes, setMes] = useState<string>("todos");
  const [anio, setAnio] = useState<string>(String(new Date().getFullYear()));
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todas");

  const [grupos, setGrupos] = useState<GrupoConCuotas[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, startSearchTransition] = useTransition();
  const [isPaying, startPaymentTransition] = useTransition();

  const handleSearch = () => {
    setError(null); setGrupos(null);
    startSearchTransition(async () => {
      const mesParam = mes === "todos" ? null : parseInt(mes);
      const result = await getCuotas(mesParam, parseInt(anio));
      if (result.success) setGrupos(result.data || []);
      else setError(result.message);
    });
  };
  
  const getStatus = (cuota: CuotaDetalle): string => {
    if (cuota.pagada) return "Pagada";
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    if (new Date(cuota.fecha_vencimiento) < hoy) return "Vencida";
    return "Pendiente";
  };

  const visibleGrupos = useMemo(() => {
      if (!grupos) return [];
      return grupos.map(grupo => ({
        ...grupo,
        cuotas: grupo.cuotas.filter(cuota => {
            const status = getStatus(cuota).toLowerCase() as StatusFilter;
            const search = searchTerm.toLowerCase();
            const matchesStatus = statusFilter === 'todas' || status === statusFilter;
            const matchesSearch = !search || grupo.grupo_nombre.toLowerCase().includes(search) || cuota.detalle.toLowerCase().includes(search);
            return matchesStatus && matchesSearch;
        })
      })).filter(grupo => grupo.cuotas.length > 0);
  }, [grupos, statusFilter, searchTerm]);

  const handleExport = () => {
    if (!grupos || grupos.length === 0) {
      toast({ title: "No hay datos para exportar", description: "Realiza una búsqueda para obtener los datos primero.", variant: "destructive" });
      return;
    }

    const dataToExport = grupos.flatMap(grupo => 
      grupo.cuotas.map(cuota => ({
        'Grupo Familiar': grupo.grupo_nombre,
        'Concepto': cuota.detalle,
        'Monto': cuota.monto,
        'Estado': getStatus(cuota),
        'Fecha de Vencimiento': new Date(cuota.fecha_vencimiento).toLocaleDateString(),
        'Mes': cuota.mes,
        'Año': cuota.anio,
      }))
    );

    if (dataToExport.length === 0) {
      toast({ title: "No hay datos para exportar", description: "La búsqueda no arrojó resultados.", variant: "destructive" });
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Historial de Cuotas');
    const fileName = mes === "todos" ? `historial_cuotas_${anio}_completo.xlsx` : `historial_cuotas_${mes}_${anio}_completo.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const handleRegistrarPago = (cuotaId: string) => {
    startPaymentTransition(async () => {
      const result = await registrarPagoManual(cuotaId);
      if (result.success) {
        toast({ title: "Éxito", description: result.message });
        // Re-fetch data to show the updated status
        handleSearch(); 
      } else {
        toast({ title: "Error", description: result.message, variant: "destructive" });
      }
    });
  };

  const anios = Array.from({ length: 10 }, (_, i) => String(new Date().getFullYear() - i));

  return (
    <div className="space-y-6">
        <Card className="p-4 bg-white/80 backdrop-blur border border-gray-200/80 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-end">
          <Select value={mes} onValueChange={setMes}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>
            <SelectItem value="todos">Todos los meses</SelectItem>
            {Array.from({length: 12}, (_,i) => <SelectItem key={i+1} value={String(i+1)}>{new Date(0,i).toLocaleString('es-ES', {month: 'long'})}</SelectItem>)}
          </SelectContent></Select>
          <Select value={anio} onValueChange={setAnio}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{anios.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent></Select>
          <Button onClick={handleSearch} disabled={isSearching} className="w-full md:col-span-1 lg:col-span-2 bg-[#1e3a8a] text-white hover:bg-[#1e3a8a]/90">
            {isSearching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}Buscar Cuotas
          </Button>
          <Button onClick={handleExport} className="w-full bg-[#efb600] text-[#1e3a8a] hover:bg-[#efb600]/90">
              <FileDown className="mr-2 h-4 w-4" /> Exportar a Excel
          </Button>
        </div>
      </Card>

      {isSearching && <p className="text-center py-8 text-gray-500">Buscando...</p>}
      {error && <Card className="p-8 text-center text-red-600 bg-red-50"><p>{error}</p></Card>}

      {grupos && (
        <Card className="bg-white/80 backdrop-blur border border-gray-200/80 shadow-sm">
          <div className="p-4 border-b flex flex-col sm:flex-row gap-4">
            <Input placeholder="Buscar por grupo o concepto..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-grow"/>
            <div className="flex items-center gap-2">
                <Button size="sm" variant={statusFilter === 'todas' ? 'default' : 'outline'} onClick={() => setStatusFilter('todas')}>Todas</Button>
                <Button size="sm" variant={statusFilter === 'pendiente' ? 'default' : 'outline'} onClick={() => setStatusFilter('pendiente')}>Pendientes</Button>
                <Button size="sm" variant={statusFilter === 'vencida' ? 'default' : 'outline'} onClick={() => setStatusFilter('vencida')}>Vencidas</Button>
                <Button size="sm" variant={statusFilter === 'pagada' ? 'default' : 'outline'} onClick={() => setStatusFilter('pagada')}>Pagadas</Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow>
                  <TableHead>Grupo Familiar</TableHead>
                  <TableHead>Conceptos</TableHead>
                  <TableHead className="text-right">Monto Total</TableHead>
                  <TableHead className="text-center">Mes</TableHead>
                  <TableHead className="text-center">Estado General</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {isSearching ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-12 text-gray-500"><Loader2 className="mx-auto h-8 w-8 animate-spin"/></TableCell></TableRow>
                ) : visibleGrupos.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-12 text-gray-500">No hay grupos que coincidan con los filtros.</TableCell></TableRow>
                ) : (
                  visibleGrupos.map(grupo => (
                    <GrupoRow 
                        key={grupo.grupo_id} 
                        grupo={grupo} 
                        onPay={handleRegistrarPago} 
                        isPaying={isPaying}
                        statusFilter={statusFilter}
                        searchTerm={searchTerm}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  )
}
