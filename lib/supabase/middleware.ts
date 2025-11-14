/*import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Proteger rutas de admin
  if (request.nextUrl.pathname.startsWith("/admin") && !user) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  // Proteger rutas de socio
  if (request.nextUrl.pathname.startsWith("/portal") && !user) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}*/
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value)
          }
          supabaseResponse = NextResponse.next({
            request,
          })
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options)
          }
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Rutas públicas que no requieren autenticación
  const publicPaths = ['/auth', '/', '/about', '/contact'] // Añade aquí las rutas públicas
  const isPublicPath = publicPaths.some(path => 
    path === '/' ? request.nextUrl.pathname === path : request.nextUrl.pathname.startsWith(path)
  )

  // Permitir acceso a rutas públicas sin autenticación
  if (isPublicPath) {
    return supabaseResponse
  }

  // Redirigir usuarios no autenticados a login
  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirectedFrom', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Obtener el perfil del usuario para validar permisos
  // Use a service-role client to read the profiles table from middleware.
  // This avoids RLS policy recursion when policies reference the profiles table.
  let profile = null
  try {
    const service = createServiceRoleClient()
    const { data, error } = await service.from('profiles').select('rol').eq('id', user.id).single()
    if (error) {
      // keep profile null and log the error server-side if needed
      // console.error('profiles lookup error:', error)
    } else {
      profile = data
    }
  } catch {
    // If service role client isn't configured, fall back to the request-bound client
    const { data } = await supabase.from('profiles').select('rol').eq('id', user.id).single()
    profile = data
  }

  // Redirigir a /admin solo si es admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (profile?.rol !== 'super_admin' && profile?.rol !== 'admin_disciplina') {
      const url = request.nextUrl.clone()
      url.pathname = '/unauthorized'
      return NextResponse.redirect(url)
    }
  }

  // Redirigir a /portal solo si es socio
  if (request.nextUrl.pathname.startsWith('/portal')) {
    if (profile?.rol !== 'socio') {
      const url = request.nextUrl.clone()
      url.pathname = '/unauthorized'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
