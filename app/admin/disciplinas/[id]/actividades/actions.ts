'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import type { ActionResult } from './types' // Importar el tipo desde el nuevo archivo

export async function createActividad(formData: FormData): Promise<ActionResult> {
  const nombre = String(formData.get('nombre'))
  const precio = formData.get('precio')
  const disciplinaId = String(formData.get('disciplinaId'))
  
  if (!nombre || !precio || !disciplinaId) {
    return { success: false, message: 'Faltan datos requeridos.' }
  }

  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, message: 'Usuario no autenticado.' }
  }

  const { error } = await supabase
    .from('actividades')
    .insert({ nombre, precio: Number(precio), disciplina_id: disciplinaId })

  if (error) {
    console.error('Error creating activity:', error)
    return { success: false, message: `Error de base de datos: ${error.message}` }
  }
  
  revalidatePath(`/admin/disciplinas/${disciplinaId}/actividades`)
  return { success: true, message: 'Actividad creada con éxito.' }
}

export async function updateActividad(formData: FormData): Promise<ActionResult> {
  const id = String(formData.get('id'))
  const nombre = String(formData.get('nombre'))
  const precio = formData.get('precio')
  const disciplinaId = String(formData.get('disciplinaId'))

  if (!id || !nombre || !precio) {
    return { success: false, message: 'Faltan datos requeridos.' }
  }

  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, message: 'Usuario no autenticado.' }
  }

  const { error } = await supabase
    .from('actividades')
    .update({ nombre, precio: Number(precio) })
    .eq('id', id)

  if (error) {
    console.error('Error updating activity:', error)
    return { success: false, message: `Error de base de datos: ${error.message}` }
  }

  revalidatePath(`/admin/disciplinas/${disciplinaId}/actividades`)
  return { success: true, message: 'Actividad actualizada con éxito.' }
}

export async function deleteActividad(formData: FormData): Promise<ActionResult> {
  const id = String(formData.get('id'))
  const disciplinaId = String(formData.get('disciplinaId'))

  if (!id) {
    return { success: false, message: 'Faltan datos requeridos.' }
  }

  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
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
