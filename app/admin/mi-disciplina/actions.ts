'use server'

import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// La función de actualización no necesita cambios.
export async function updateMiembroStatus(
    inscripcionId: string, 
    newStatus: boolean
) {
  if (!inscripcionId) {
    return { error: 'ID de inscripción no proporcionado.' }
  }

  const supabase = createServiceRoleClient()

  const { error } = await supabase.from('inscripciones').update({ activa: newStatus }).eq('id', inscripcionId)

  if (error) {
    console.error('Error al actualizar el estado del miembro:', error)
    return { error: 'No se pudo actualizar el estado.' }
  }

  revalidatePath('/admin/mi-disciplina')
  return { success: true }
}

// FUNCIÓN CORREGIDA: Llama a la RPC de la base de datos en lugar de hacer un select complejo.
export async function getMiembrosPorDisciplina() {
  const supabase = await createClient()

  // Se llama a la función 'get_miembros_de_mi_disciplina' que creamos en la base de datos.
  const { data, error } = await supabase.rpc('get_miembros_de_mi_disciplina')

  if (error) {
    console.error('Error al cargar los miembros de la disciplina desde RPC:', error)
    return { error: `Error al cargar miembros: ${error.message}` }
  }

  // La función RPC ya devuelve los datos en el formato que necesitamos.
  return { data }
}
