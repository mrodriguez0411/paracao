/**
 * This middleware is responsible for:
 * 1.  Refreshing the user's session cookie if it has expired.
 * 2.  Redirecting unauthenticated users from protected routes.
 * 3.  Injecting the user's role as a request header for easier access in server components.
 */
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function updateSession(request: NextRequest) {
  // This response object will be passed to the Supabase client.
  // It will be updated with the session cookie if it is refreshed.
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // If the cookie is set, update the request and response cookies.
          request.cookies.set({ name, value, ...options })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          // If the cookie is removed, update the request and response cookies.
          request.cookies.set({ name, value: '', ...options })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // This will refresh the session cookie if needed.
  const { data: { user } } = await supabase.auth.getUser()

  // --- Authorization Logic ---

  const publicPaths = ['/auth', '/', '/about', '/contact', '/unauthorized']
  const isPublicPath = publicPaths.some(path =>
    path === '/' ? request.nextUrl.pathname === path : request.nextUrl.pathname.startsWith(path)
  )

  if (isPublicPath) {
    return response // Return the response with the possibly updated session cookie.
  }

  // If no user, and not a public path, redirect to login.
  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirectedFrom', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // --- Role-based Authorization ---

  const service = createServiceRoleClient()
  const { data: profile } = await service.from('profiles').select('rol').eq('id', user.id).single()

  // Add debug headers for easier troubleshooting in Network tab
  response.headers.set('x-user-role', profile?.rol || 'null')
  response.headers.set('x-user-id', user.id || 'null')
  response.headers.set('x-pathname', request.nextUrl.pathname)
  
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const allowedRoles = ['super_admin', 'admin_disciplina']
    if (!profile?.rol || !allowedRoles.includes(profile.rol)) {
      const url = request.nextUrl.clone()
      url.pathname = '/unauthorized'
      url.searchParams.set('reason', !profile?.rol ? 'no_role' : 'role_denied')
      url.searchParams.set('role', profile?.rol || 'null')
      url.searchParams.set('path', request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }
  }

  if (request.nextUrl.pathname.startsWith('/portal')) {
    // Socio: permitir acceso al portal
    if (profile?.rol === 'socio') {
      return response
    }
    // Admins: redirigir amigablemente al panel de administración
    const url = request.nextUrl.clone()
    url.pathname = '/admin'
    url.searchParams.set('from', '/portal')
    return NextResponse.redirect(url)
  }
  
  // Return the response object with the updated session and the new header.
  return response
}
