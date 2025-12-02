
"use client";

import { useState, useTransition } from "react";
import { getHistorialCuotas, type MiembroConEstado } from "./actions";

import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2 } from "lucide-react";

// --- Componente de la Página ---
export default function HistorialCuotasPage() {
  // --- Estados del componente ---
  // 1. Para manejar la selección del mes y año
  const [mes, setMes] = useState<string>(String(new Date().getMonth() + 1));
  const [anio, setAnio] = useState<string>(String(new Date().getFullYear()));

  // 2. Para almacenar el resultado de la búsqueda
  const [resultado, setResultado] = useState<MiembroConEstado[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 3. Para manejar el estado de carga (loading)
  const [isPending, startTransition] = useTransition();

  // --- Lógica de la Búsqueda ---
  const handleSearch = () => {
    setError(null);
    setResultado(null);

    startTransition(async () => {
      const mesNum = parseInt(mes, 10);
      const anioNum = parseInt(anio, 10);

      const result = await getHistorialCuotas(mesNum, anioNum);

      if (result.success) {
        setResultado(result.data);
      } else {
        setError(result.message);
      }
    });
  };

  // --- Generador de Años para el Select ---
  const anios = Array.from({ length: 10 }, (_, i) => String(new Date().getFullYear() - i));

  // --- Renderizado del Componente ---
  return (
    <div className="space-y-6">
      {/* 1. Título y Descripción */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight" style={{color:'#efb600'}}>Historial de Cuotas</h2>
        <p className="text-muted-foreground" style={{color:'#efb600'}}>Selecciona un mes y año para ver el estado de las cuotas de los miembros.</p>
      </div>

      {/* 2. Filtros de Búsqueda */}
      <Card className="p-4 flex flex-col md:flex-row gap-4 items-center bg-textura-amarilla">
        <div className="w-full md:w-auto flex-1">
          <label htmlFor="mes-select" style={{color:'#1e3a8a', fontSize:'16px', fontWeight:'bold', textTransform:'uppercase'}}>Mes</label>
          <Select value={mes} onValueChange={setMes}>
            <SelectTrigger id="mes-select"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => (
                <SelectItem key={i + 1} value={String(i + 1)}>{new Date(0, i).toLocaleString('es-ES', { month: 'long' })}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full md:w-auto flex-1 alling:center">
          <label htmlFor="anio-select" style={{color:'#1e3a8a', fontSize:'16px', fontWeight:'bold', textTransform:'uppercase'}}>Año</label>
          <Select value={anio} onValueChange={setAnio}>
            <SelectTrigger id="anio-select"><SelectValue /></SelectTrigger>
            <SelectContent>{anios.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <Button onClick={handleSearch} disabled={isPending} className="w-full md:w-auto mt-4 md:mt-0">
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
          Buscar
        </Button>
      </Card>

      {/* 3. Resultados de la Búsqueda */}
      {isPending && <p className="text-center text-muted-foreground">Buscando...</p>}
      {error && <Card className="p-8 text-center text-red-600 bg-red-50"><p>{error}</p></Card>}
      
      {resultado && (
        <Card className="border border-gray-100 shadow-sm rounded-xl overflow-hidden mt-6">
          {resultado.length === 0 ? (
            <p className="p-8 text-center text-muted-foreground">No se encontraron miembros para el período seleccionado.</p>
          ) : (
            <Table>
              <TableHeader className="bg-white border-b border-gray-100">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-gray-500 font-medium text-[11px] tracking-wider uppercase py-4 pl-6">Nombre Completo</TableHead>
                  <TableHead className="text-gray-500 font-medium text-[11px] tracking-wider uppercase py-4">DNI</TableHead>
                  <TableHead className="text-gray-500 font-medium text-[11px] tracking-wider uppercase py-4 text-right pr-6">Estado Cuota</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resultado.map((miembro) => (
                  <TableRow key={miembro.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0">
                    <TableCell className="py-4 pl-6 font-medium text-gray-900">{miembro.nombre_completo}</TableCell>
                    <TableCell className="text-sm text-gray-700">{miembro.dni || "-"}</TableCell>
                    <TableCell className="text-sm text-gray-700 text-right pr-6">
                      <Badge className={`font-semibold ${
                        miembro.estado_cuota === 'Al día'
                          ? 'bg-green-100 text-green-800 hover:bg-green-100'
                          : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                      }`}>
                        {miembro.estado_cuota}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      )}
    </div>
  );
}
