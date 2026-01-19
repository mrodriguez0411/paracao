'use server'

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";

// --- Tipos de Datos ---
// Corresponde a la estructura devuelta por la nueva función SQL
export type HistorialCuota = {
  actividad_id: string;
  actividad_nombre: string;
  miembro_id: string;
  nombre_completo: string;
  estado_pago: 'Pagada' | 'Pendiente';
  fecha_pago: string | null;
  monto_pagado: number | null;
  cuota_id: string; // Puede ser null si la cuota no fue generada
};

interface ActionResult {
  success: boolean;
  data?: HistorialCuota[];
  message: string;
}

/**
 * Obtiene el historial de cuotas para todas las actividades de la disciplina
 * que administra el usuario actual para un mes y año específicos.
 * Utiliza la función RPC `get_historial_cuotas_disciplina`.
 */
export async function getHistorialCuotasDisciplina(
  mes: number,
  anio: number
): Promise<ActionResult> {
  // 1. Requerir autenticación y rol específico
  await requireAuth(['admin_disciplina']);

  // 2. Validación de entrada
  if (!mes || mes < 1 || mes > 12) {
    return { success: false, message: "Mes inválido." };
  }
  if (!anio || anio < 2020) {
    return { success: false, message: "Año inválido." };
  }

  const supabase = createClient();

  try {
    // 3. Llamar a la función RPC en Supabase
    const { data, error } = await supabase.rpc('get_historial_cuotas_disciplina', {
      p_mes: mes,
      p_anio: anio,
    });

    if (error) {
      console.error('Error al llamar a get_historial_cuotas_disciplina:', error);
      throw new Error(error.message);
    }

    // 4. Devolver los datos con éxito
    return { 
      success: true, 
      data: data || [], 
      message: "Historial obtenido con éxito." 
    };

  } catch (error: any) {
    console.error("Error en la acción getHistorialCuotasDisciplina:", error);
    return { success: false, message: `Error en el servidor: ${error.message}` };
  }
}
