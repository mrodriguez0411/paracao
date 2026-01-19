'use server'

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

interface ActionResult {
  success: boolean;
  message: string;
}

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
    .insert({
      nombre,
      precio: Number(precio),
      disciplina_id: disciplinaId,
    })

  if (error) {
    console.error('Error creating activity:', error)
    return { success: false, message: `Error de base de datos: ${error.message}` }
  }
  
  revalidatePath(`/admin/disciplinas/${disciplinaId}/actividades`)
  return { success: true, message: 'Actividad creada con éxito.' }
}
