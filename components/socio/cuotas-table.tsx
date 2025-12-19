
import { Table, TableBody, TableCaption, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CuotaRow } from './cuota-row';
import { Card } from "@/components/ui/card";

// Tipos
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

interface CuotasTableProps {
  cuotas: Cuota[];
  tipo: 'social' | 'deportiva';
}

export function CuotasTable({ cuotas, tipo }: CuotasTableProps) {
  if (cuotas.length === 0) {
    return (
        <Card className="mt-4 p-8 text-center border-dashed border-gray-300 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">No se encontraron cuotas que coincidan con la búsqueda.</p>
        </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <Table>
        <TableCaption>Un historial de tus cuotas {tipo === 'social' ? 'sociales' : 'deportivas'}.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px]">Período</TableHead>
            {tipo === 'deportiva' && <TableHead>Miembro</TableHead>}
            {tipo === 'deportiva' && <TableHead>Disciplina</TableHead>}
            <TableHead>Vencimiento</TableHead>
            <TableHead className="text-right">Monto</TableHead>
            <TableHead className="text-center">Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cuotas.map((cuota) => (
            <CuotaRow key={cuota.id} cuota={cuota} />
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
