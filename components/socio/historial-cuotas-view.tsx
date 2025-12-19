'use client'

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CuotasTable } from './cuotas-table';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Tipos (deberían coincidir con los del servidor)
interface Cuota {
  id: string;
  mes: number;
  anio: number;
  monto: number;
  pagada: boolean;
  fecha_vencimiento: string;
  tipo: 'social' | 'deportiva';
  disciplina_nombre?: string;
  miembro_nombre?: string;
}

interface HistorialCuotasViewProps {
  cuotasSociales: Cuota[];
  cuotasDeportivas: Cuota[];
}

// Mapa para convertir el número del mes a nombre
const meses: { [key: number]: string } = {
    1: 'Enero', 2: 'Febrero', 3: 'Marzo', 4: 'Abril', 5: 'Mayo', 6: 'Junio',
    7: 'Julio', 8: 'Agosto', 9: 'Septiembre', 10: 'Octubre', 11: 'Noviembre', 12: 'Diciembre'
};

export function HistorialCuotasView({ cuotasSociales, cuotasDeportivas }: HistorialCuotasViewProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all'); // 'all', 'paid', 'unpaid'

    const filterCuotas = (cuotas: Cuota[]) => {
        return cuotas.filter(cuota => {
            const searchTermLower = searchTerm.toLowerCase();
            const matchesSearch = searchTerm === '' ||
                (cuota.miembro_nombre && cuota.miembro_nombre.toLowerCase().includes(searchTermLower)) ||
                (cuota.disciplina_nombre && cuota.disciplina_nombre.toLowerCase().includes(searchTermLower)) ||
                meses[cuota.mes].toLowerCase().includes(searchTermLower) ||
                String(cuota.anio).includes(searchTermLower);

            const matchesFilter = filter === 'all' ||
                (filter === 'paid' && cuota.pagada) ||
                (filter === 'unpaid' && !cuota.pagada);

            return matchesSearch && matchesFilter;
        });
    };

    return (
        <Tabs defaultValue="social" className="w-full space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <TabsList className="grid grid-cols-2 w-full max-w-sm">
                    <TabsTrigger value="social">Cuotas Sociales</TabsTrigger>
                    <TabsTrigger value="deportivas">Cuotas Deportivas</TabsTrigger>
                </TabsList>
                <div className="w-full md:max-w-xs relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input 
                        placeholder="Buscar por miembro, disciplina, mes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                 <div className="flex items-center gap-2">
                    <Button variant={filter === 'all' ? "secondary" : "ghost"} onClick={() => setFilter('all')} className="flex items-center gap-2"><SlidersHorizontal className="h-4 w-4"/> Todas</Button>
                    <Button variant={filter === 'paid' ? "secondary" : "ghost"} onClick={() => setFilter('paid')} className="text-green-600 hover:text-green-700">Pagadas</Button>
                    <Button variant={filter === 'unpaid' ? "secondary" : "ghost"} onClick={() => setFilter('unpaid')} className="text-red-600 hover:text-red-700">Pendientes</Button>
                </div>
            </div>

            <TabsContent value="social">
                <CuotasTable cuotas={filterCuotas(cuotasSociales)} tipo="social" />
            </TabsContent>
            <TabsContent value="deportivas">
                <CuotasTable cuotas={filterCuotas(cuotasDeportivas)} tipo="deportiva" />
            </TabsContent>
        </Tabs>
    );
}
