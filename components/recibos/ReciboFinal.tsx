'use client'

import React, { useEffect, useRef } from 'react';

interface ReciboProps {
  pagoData: any;
  nuevoPago: any;
  onClose: () => void;
}

const ReciboFinal: React.FC<ReciboProps> = ({ pagoData, nuevoPago, onClose }) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (receiptRef.current) {
      receiptRef.current.style.display = 'block';
      setTimeout(() => window.print(), 100);
    }
  }, []);

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
      const offset = date.getTimezoneOffset();
      const correctedDate = new Date(date.getTime() + offset * 60000);
      return correctedDate.toLocaleDateString('es-AR');
    } catch (e) {
      return 'Fecha inválida';
    }
  };

  const grupo = pagoData?.grupo || {};
  const titular = grupo.titular || { nombre_completo: 'Socio no especificado', email: 'N/A', dni: 'N/A' };
  const tipo_cuota = grupo.tipo_cuota || null;
  const disciplinas = grupo.disciplinas || [];
  const pago = nuevoPago || { id: '0', monto: 0, fecha_pago: '' };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50 print-hidden">
      <div ref={receiptRef} className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm printable-area text-black text-sm">
        
        <div className="text-center mb-4">
          <h1 className="text-xl font-bold">CLUB PARACAO</h1>
          <p className="text-xs">RECIBO N° {String(pago.id).padStart(8, '0')}</p>
        </div>

        <div className="border-t border-dashed border-gray-400 pt-2 mb-2">
          <p>Socio: {titular.nombre_completo}</p>
          <p>Fecha: {formatDate(pago.fecha_pago)}</p>
        </div>

        <h2 className="font-bold text-center border-y border-dashed border-gray-400 my-2 py-1">Detalle del Pago</h2>
        
        <table className="w-full mb-2">
          <thead>
            <tr>
              <th className="text-left font-semibold">Concepto</th>
              <th className="text-right font-semibold">Importe</th>
            </tr>
          </thead>
          <tbody>
            {tipo_cuota && tipo_cuota.monto > 0 && (
              <tr>
                <td>Cuota Social ({tipo_cuota.nombre})</td>
                <td className="text-right">{formatCurrency(tipo_cuota.monto)}</td>
              </tr>
            )}
            {disciplinas.map((d: any, index: number) => (
              <tr key={index}>
                <td>{d.nombre} ({d.miembro_nombre})</td>
                <td className="text-right">{formatCurrency(d.monto)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="border-t border-dashed border-gray-400 pt-2 mt-2">
            <p><span className="font-semibold">Forma de Pago:</span> {pago.tipo_pago || 'No especificada'}</p>
        </div>

        <div className="border-t border-dashed border-gray-400 pt-2 mt-2">
          <div className="flex justify-end">
            <p className="text-lg font-bold">TOTAL: {formatCurrency(pago.monto)}</p>
          </div>
        </div>

        <div className="mt-4 text-center text-xs text-gray-600">
           <p>Cód. Pago: {String(pago.id).padStart(16, '0')}</p>
           <p className="mt-2">Gracias por su pago.</p>
        </div>

        <div className="mt-6 text-center print-hidden">
          <button
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
          >
            Cerrar
          </button>
        </div>
      </div>
       <style jsx global>{`
            @media print {
                body {
                    background-color: white !important;
                }
                .print-hidden {
                    display: none !important;
                }
                .printable-area {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                    max-width: 100%;
                    box-shadow: none;
                    border-radius: 0;
                    padding: 10px;
                }
            }
        `}</style>
    </div>
  );
};

export default ReciboFinal;
