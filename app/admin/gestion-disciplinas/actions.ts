'use server'

import { createServiceRoleClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Actualiza el administrador asignado a una disciplina.
 * Esta acción se ejecuta en el servidor para garantizar la seguridad.
 * @param disciplinaId El ID de la disciplina a actualizar.
 * @param adminId El ID del nuevo administrador, o null si se quita la asignación.
 * @returns Un objeto indicando éxito o un error.
 */
export async function updateDisciplinaAdmin(
  disciplinaId: string,
  adminId: string | null
): Promise<{ success: true } | { error: string }> {
  // Se usa el cliente con rol de servicio para poder sobreescribir las RLS.
  // La seguridad ya está garantizada porque la página que invoca esta acción
  // solo es accesible para super_admins.
  const supabase = createServiceRoleClient();

  if (!disciplinaId) {
    return { error: "Se requiere el ID de la disciplina." };
  }

  const { error } = await supabase
    .from("disciplinas")
    .update({ admin_id: adminId })
    .eq("id", disciplinaId);

  if (error) {
    console.error("Error al actualizar la disciplina:", error);
    return { error: "No se pudo actualizar la asignación en la base de datos." };
  }

  // Invalida la caché de la página de gestión para que los cambios se reflejen inmediatamente.
  revalidatePath("/admin/gestion-disciplinas");

  return { success: true };
}
