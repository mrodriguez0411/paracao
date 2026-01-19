'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import type { ActionResult } from './types'

// --- Helper para validar el precio ---
function validatePrice(precioStr: string | null): { isValid: boolean; value: number; message?: string } {
  if (precioStr === null || precioStr.trim() === '') {
    return { isValid: false, value: 0, message: 'El precio es un campo requerido.' };
  }
  
  const precioNum = Number(precioStr);
  
  if (isNaN(precioNum)) {
    return { isValid: false, value: 0, message: 'El precio debe ser un número válido.' };
  }
  
  if (precioNum < 0) {
    return { isValid: false, value: 0, message: 'El precio no puede ser un número negativo.' };
  }
  
  return { isValid: true, value: precioNum };
}

// --- Server Action: Crear Actividad ---
export async function createActividad(formData: FormData): Promise<ActionResult> {
  const nombre = String(formData.get('nombre'))
  const precioStr = formData.get('precio') as string | null
  const disciplinaId = String(formData.get('disciplinaId'))

  // Validación de datos
  if (!nombre || !disciplinaId) {
    return { success: false, message: 'Faltan el nombre o el ID de la disciplina.' }
  }
  
  const priceValidation = validatePrice(precioStr);
  if (!priceValidation.isValid) {
    return { success: false, message: priceValidation.message };
  }

  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name: string) => cookieStore.get(name)?.value } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, message: 'Usuario no autenticado.' }
  }

  // Inserción en la base de datos
  const { error } = await supabase
    .from('actividades')
    .insert({ nombre, precio: priceValidation.value, disciplina_id: disciplinaId })

  if (error) {
    console.error('Error creating activity:', error)
    return { success: false, message: `Error de base de datos: ${error.message}` }
  }
  
  revalidatePath(`/admin/disciplinas/${disciplinaId}/actividades`)
  return { success: true, message: 'Actividad creada con éxito.' }
}

// --- Server Action: Actualizar Actividad ---
export async function updateActividad(formData: FormData): Promise<ActionResult> {
  const id = String(formData.get('id'))
  const nombre = String(formData.get('nombre'))
  const precioStr = formData.get('precio') as string | null
  const disciplinaId = String(formData.get('disciplinaId'))

  // Validación de datos
  if (!id || !nombre || !disciplinaId) {
    return { success: false, message: 'Faltan datos requeridos (ID, nombre o ID de disciplina).' }
  }
  
  const priceValidation = validatePrice(precioStr);
  if (!priceValidation.isValid) {
    return { success: false, message: priceValidation.message };
  }

  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name: string) => cookieStore.get(name)?.value } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, message: 'Usuario no autenticado.' }
  }

  // Actualización en la base de datos
  const { error } = await supabase
    .from('actividades')
    .update({ nombre, precio: priceValidation.value })
    .eq('id', id)

  if (error) {
    console.error('Error updating activity:', error)
    return { success: false, message: `Error de base de datos: ${error.message}` }
  }

  revalidatePath(`/admin/disciplinas/${disciplinaId}/actividades`)
  return { success: true, message: 'Actividad actualizada con éxito.' }
}

// --- Server Action: Eliminar Actividad ---
export async function deleteActividad(formData: FormData): Promise<ActionResult> {
  const id = String(formData.get('id'))
  const disciplinaId = String(formData.get('disciplinaId'))

  if (!id || !disciplinaId) {
    return { success: false, message: 'Faltan datos requeridos para eliminar.' }
  }

  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name: string) => cookieStore.get(name)?.value } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, message: 'Usuario no autenticado.' }
  }

  const { error } = await supabase.from('actividades').delete().eq('id', id)

  if (error) {
    console.error('Error deleting activity:', error)
    return { success: false, message: `Error de base de datos: ${error.message}` }
  }

  revalidatePath(`/admin/disciplinas/${disciplinaId}/actividades`)
  return { success: true, message: 'Actividad eliminada con éxito.' }
}
