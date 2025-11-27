"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useState } from "react"

// Simple SVG icon for visibility toggle
const EyeIcon = ({
  size = 20,
  className,
  ...props
}: React.SVGProps<SVGSVGElement> & { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const EyeOffIcon = ({
  size = 20,
  className,
  ...props
}: React.SVGProps<SVGSVGElement> & { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
)


async function handleLoginAction(email: string, password: string) {
  const supabase = createClient()

  try {
    console.log("Intentando login con:", email)
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("Error de autenticación:", error)
      throw new Error(`Error de autenticación: ${error.message}`)
    }

    console.log("Login exitoso:", data.user.email)

    // Forzar sincronización de sesión con el servidor
    // Esto asegura que las cookies de sesión se establezcan correctamente
    await supabase.auth.getSession()

    // Esperar un momento para que se actualice la sesión
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Redirigir basado en el rol (se determina en el middleware)
    return { success: true, user: data.user }
  } catch (error: unknown) {
    console.error("Error completo:", error)
    throw error instanceof Error ? error : new Error("Error al iniciar sesión")
  }
}

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await handleLoginAction(email, password)

      // Después del sign-in, pedir al servidor el profile real (usa cookies)
      // y redirigir según `profile.rol`. Esto evita depender de user_metadata
      // que puede estar desincronizado.
      try {
        const res = await fetch('/api/debug/session', { credentials: 'same-origin' })
        if (res.ok) {
          const json = await res.json()
          const role = json?.profile?.rol
          if (role === 'super_admin' || role === 'admin_disciplina') {
            router.push('/admin')
          } else {
            router.push('/portal')
          }
        } else {
          // Fallback: ir a portal
          router.push('/portal')
        }
      } catch {
        // Si falla la petición, caer al fallback
        router.push('/portal')
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al iniciar sesión")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-textura-azul bg-fixed">
      <div className="w-full max-w-sm">
        <Card className="bg-textura-amarilla border-0 shadow-lg rounded-lg pb-6">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-4xl font-oswald font-bold text-[#1e3a8a] mb-2">Club Paracao</CardTitle>
            <CardDescription className="text-[#1e3a8a] text-base font-semibold">Iniciar Sesión</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-[#1e3a8a] font-semibold">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="login-input border-[#1e3a8a]/30 focus:border-[#1e3a8a] focus:ring-[#1e3a8a] input-transparent text-black"
                  />
                </div>
                <div className="grid gap-2 relative">
                  <Label htmlFor="password" className="text-[#1e3a8a] font-semibold">Contraseña</Label>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="login-input border-[#1e3a8a]/30 focus:border-[#1e3a8a] focus:ring-[#1e3a8a] input-transparent pr-10 text-black"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-[2.5rem] transform -translate-y-1/2 text-[#1e3a8a] hover:text-[#1e3a8a]/80"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {error && <p className="text-sm text-red-600 font-semibold">{error}</p>}
                <Button type="submit" className="w-full bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white font-semibold text-lg py-6" disabled={isLoading}>
                  {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
                </Button>
                <Button asChild variant="outline" className="w-full border-[#1e3a8a] text-[#1e3a8a] hover:bg-[#1e3a8a]/5 font-semibold py-6">
                  <Link href="/">Ir al sitio web</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
