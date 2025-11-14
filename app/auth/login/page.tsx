"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useState } from "react"

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
    <div className="flex min-h-screen w-full items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
            <CardDescription>Ingresa tus credenciales para acceder</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
