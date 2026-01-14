'use server'

import { createClient } from "@/lib/supabase/server";

// VERSIÓN 22.0: Se elimina la acción de pago. Solo consulta.

/**
 * Obtiene los miembros de la disciplina para un mes y año específicos.
 * La función RPC subyacente ahora usa un INNER JOIN, por lo que solo devuelve
 * resultados si las cuotas para ese período han sido generadas.
 */
export async function getMiembrosPorDisciplina(anio: number, mes: number) {
  const supabase = await createClient();
  
  const { data, error } = await supabase.rpc('buscar_miembros_disciplina', {
    anio_param: anio,
    mes_param: mes
  });

  if (error) {
    console.error('Error al llamar al RPC buscar_miembros_disciplina:', error);
    return { data: [], error: error.message };
  }

  return { data: data || [], error: null };
}
