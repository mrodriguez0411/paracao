
"use server"

import { requireAuth } from "@/lib/auth";
import { createServiceRoleClient } from "@/lib/supabase/server";

// Definir la interfaz para los datos que devolveremos.
export interface MiembroConEstado {
  id: string;
  nombre_completo: string;
  dni: string | null;
  fecha_inscripcion: string;
  estado_cuota: 'Al día' | 'Pendiente';
}

// Definir la interfaz para la respuesta de la acción
interface ActionResult {
  success: boolean;
  data: MiembroConEstado[] | null;
  message: string;
}

// Acción de servidor asíncrona
export async function getHistorialCuotas(mes: number, anio: number): Promise<ActionResult> {
  // Autenticación y validación de perfil
  const profile = await requireAuth(["admin_disciplina"]);
  if (!profile) {
    return { success: false, data: null, message: "Acceso denegado." };
  }

  // Validar los parámetros de entrada
  if (!mes || !anio || mes < 1 || mes > 12 || anio < 2020) {
    return { success: false, data: null, message: "Mes o año inválido." };
  }

  const supabase = createServiceRoleClient();
  
  // --- CORRECCIÓN CLAVE ---
  // Llamar a la función RPC con los parámetros en el orden alfabético correcto
  // que espera la nueva definición de la base de datos.
  const { data, error } = await supabase.rpc("get_miembros_disciplina_por_mes", {
    admin_id_param: profile.id,
    anio_param: anio, // `anio_param` va antes que `mes_param`
    mes_param: mes,
  });

  // Manejo de errores de la base de datos
  if (error) {
    console.error("Error al obtener el historial de cuotas:", error);
    return { success: false, data: null, message: `Error en la base de datos: ${error.message}` };
  }

  // Devolver los datos con éxito
  return { success: true, data: data as MiembroConEstado[], message: "Datos obtenidos correctamente." };
}
