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

  // Permitir acceso a login sin autenticación
  if (request.nextUrl.pathname.startsWith('/auth')) {
    return supabaseResponse
  }

  // Redirigir usuarios no autenticados a login
  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // Obtener el perfil del usuario para validar permisos
  const { data: profile } = await supabase
    .from('profiles')
    .select('rol')
    .eq('id', user.id)
    .single()

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
