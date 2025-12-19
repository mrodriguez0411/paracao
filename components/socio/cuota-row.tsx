
import { TableRow, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CreditCard, Receipt } from "lucide-react";

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

interface CuotaRowProps {
    cuota: Cuota;
}

// Mapa para convertir el número del mes a nombre
const meses: { [key: number]: string } = {
    1: 'Enero', 2: 'Febrero', 3: 'Marzo', 4: 'Abril', 5: 'Mayo', 6: 'Junio',
    7: 'Julio', 8: 'Agosto', 9: 'Septiembre', 10: 'Octubre', 11: 'Noviembre', 12: 'Diciembre'
};

export function CuotaRow({ cuota }: CuotaRowProps) {
    const isVencida = !cuota.pagada && new Date(cuota.fecha_vencimiento) < new Date();

    return (
        <TableRow className={cuota.pagada ? 'bg-green-50/50 dark:bg-green-900/10' : ''}>
            <TableCell className="font-medium">{meses[cuota.mes]} {cuota.anio}</TableCell>
            {cuota.tipo === 'deportiva' && <TableCell>{cuota.miembro_nombre || 'N/A'}</TableCell>}
            {cuota.tipo === 'deportiva' && <TableCell>{cuota.disciplina_nombre || 'N/A'}</TableCell>}
            <TableCell>{new Date(cuota.fecha_vencimiento).toLocaleDateString()}</TableCell>
            <TableCell className="text-right font-semibold">${cuota.monto.toFixed(2)}</TableCell>
            <TableCell className="text-center">
                <Badge variant={cuota.pagada ? 'default' : (isVencida ? 'destructive' : 'outline')}>
                    {cuota.pagada ? 'Pagada' : (isVencida ? 'Vencida' : 'Pendiente')}
                </Badge>
            </TableCell>
            <TableCell className="text-right">
                {cuota.pagada ? (
                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                        <Receipt className="h-4 w-4"/> Ver Comprobante
                    </Button>
                ) : (
                    <Button size="sm" className="flex items-center gap-2 bg-[#1e3a8a] hover:bg-[#1e3a8a]/90">
                       <CreditCard className="h-4 w-4"/> Pagar Ahora
                    </Button>
                )}
            </TableCell>
        </TableRow>
    );
}
