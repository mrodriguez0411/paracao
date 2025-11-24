/*import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // setAll method called from Server Component - can be ignored
        }
      },
    },
  })
}
*/
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// Create a server supabase client using the request cookies
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet: any[]) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options)
          }
        } catch {
          // ignore
        }
      },
    },
  })
}

// Backwards-compatible helper
export const createServerSupabaseClient = createClient;

// Service role client (server-only). Use this when you need to bypass RLS
// for trusted server-side lookups (for example, reading the `profiles` table
// inside middleware). Make sure `SUPABASE_SERVICE_ROLE_KEY` is set in the
// environment on the server and NEVER expose it to the browser.
export function createServiceRoleClient() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY

    console.log('Creando cliente de servicio con URL:', url ? 'URL presente' : 'URL faltante')
    console.log('Clave de servicio:', key ? 'Presente' : 'Faltante')

    if (!url || !key) {
      console.error('Error: Faltan variables de entorno necesarias')
      console.error('NEXT_PUBLIC_SUPABASE_URL:', url ? 'Presente' : 'Faltante')
      console.error('SUPABASE_SERVICE_ROLE_KEY:', key ? 'Presente' : 'Faltante')
      throw new Error('Error de configuración: Faltan variables de entorno necesarias')
    }

    // Verificar que la URL y la clave tengan el formato correcto
    if (!url.startsWith('http')) {
      console.error('Error: URL de Supabase inválida')
      throw new Error('URL de Supabase inválida')
    }

    if (key.length < 20) {
      console.error('Error: Clave de servicio de Supabase inválida')
      throw new Error('Clave de servicio de Supabase inválida')
    }

    const client = createSupabaseClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    console.log('Cliente de servicio creado exitosamente')
    return client
  } catch (error) {
    console.error('Error al crear el cliente de servicio:', error)
    throw error // Relanzar el error para que sea manejado por el llamador
  }
}