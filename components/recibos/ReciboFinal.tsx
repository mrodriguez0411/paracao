'use client'

import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Printer, X } from 'lucide-react';

interface ReciboProps {
  pagoData: any;
  nuevoPago: any;
  onClose: () => void;
}

const ReciboFinal: React.FC<ReciboProps> = ({ pagoData, nuevoPago, onClose }) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (amount: number | null | undefined) => {
    const numAmount = Number(amount || 0);
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(numAmount);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Fecha no disponible';
    try {
      const date = new Date(dateString);
      // Adjust for timezone offset to show the correct local date
      const offset = date.getTimezoneOffset();
      const correctedDate = new Date(date.getTime() + offset * 60000);
      return correctedDate.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch (e) {
      return 'Fecha inválida';
    }
  };

  const pago = nuevoPago || { id: '0', monto: 0, fecha_pago: '' };
  const grupo = pagoData?.grupo || {};
  const titular = grupo.titular || { nombre_completo: 'Socio no especificado', email: 'N/A', dni: 'N/A' };
  const cuotasPagadas = pagoData?.disciplinas || []; // Renamed for clarity from `disciplinas` to `cuotasPagadas`
  
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex justify-center items-center z-50 print:bg-white">
      <div className="flex flex-col w-full max-w-sm">
        <div ref={receiptRef} className="bg-white p-8 rounded-t-lg shadow-2xl text-black text-sm printable-area">
          
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">CLUB ATLÉTICO PARACAO</h1>
            <p className="text-xs text-gray-600">RECIBO OFICIAL N° {String(pago.id).slice(-8).padStart(8, '0')}</p>
          </div>

          <div className="border-t border-b border-gray-300 py-2 mb-4 text-xs">
            <div className="flex justify-between"><span className="font-semibold">Socio:</span> <span>{titular.nombre_completo}</span></div>
            <div className="flex justify-between"><span className="font-semibold">Fecha de Emisión:</span> <span>{formatDate(pago.fecha_pago)}</span></div>
            <div className="flex justify-between"><span className="font-semibold">DNI:</span> <span>{titular.dni || 'N/A'}</span></div>
          </div>

          <h2 className="font-bold text-center border-y border-dashed border-gray-400 my-3 py-1">Detalle del Pago</h2>
          
          <table className="w-full mb-4 text-xs">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="text-left font-bold py-1">Concepto</th>
                <th className="text-right font-bold py-1">Importe</th>
              </tr>
            </thead>
            <tbody>
              {cuotasPagadas.map((cuota: any, index: number) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="py-1.5">{cuota.descripcion || 'Cuota'}</td>
                  <td className="text-right py-1.5">{formatCurrency(cuota.monto)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="border-t-2 border-dashed border-gray-400 pt-3 mt-4 space-y-1 text-xs">
              <p><span className="font-semibold">Forma de Pago:</span> <span className="capitalize">{pago.tipo_pago || 'No especificada'}</span></p>
          </div>

          <div className="border-t-2 border-gray-900 pt-3 mt-4">
            <div className="flex justify-end items-baseline">
              <p className="text-base font-bold mr-2">TOTAL:</p>
              <p className="text-xl font-bold">{formatCurrency(pago.monto)}</p>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-gray-500">
             <p className="font-mono">ID de Pago: {pago.id}</p>
             <p className="mt-2 font-semibold">Gracias por su pago.</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-gray-800 p-4 rounded-b-lg flex justify-between print-hidden shadow-2xl">
          <Button
            onClick={onClose}
            variant="outline"
            className="text-white border-gray-600 hover:bg-gray-700 hover:text-white"
          >
            <X className="h-4 w-4 mr-2" />
            Cerrar
          </Button>
          <Button
            onClick={handlePrint}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
          >
            <Printer className="h-4 w-4 mr-2" />
            Imprimir Recibo
          </Button>
        </div>
      </div>
       <style jsx global>{`
            @media print {
                body {
                    background: white !important;
                }
                .print-hidden {
                    display: none !important;
                }
                .printable-area {
                    position: absolute;
                    left: 0;
                    top: 0;
                    margin: 0;
                    padding: 20px;
                    width: 100%;
                    height: auto;
                    max-width: 100%;
                    box-shadow: none;
                    border-radius: 0;
                    border: none;
                }
                .fixed {
                  position: relative !important;
                }
            }
        `}</style>
    </div>
  );
};

export default ReciboFinal;
