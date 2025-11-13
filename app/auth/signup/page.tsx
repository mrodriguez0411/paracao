"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [nombreCompleto, setNombreCompleto] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const { error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nombre_completo: nombreCompleto,
            rol: "socio",
          },
        },
      })

      if (signupError) throw signupError

      alert("¡Registro exitoso! Por favor, verifica tu email para confirmar tu cuenta.")
      router.push("/auth/login")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al registrarse")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Crear Cuenta</CardTitle>
            <CardDescription>Regístrate para acceder al sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="nombre">Nombre Completo</Label>
                  <Input
                    id="nombre"
                    type="text"
                    placeholder="Tu nombre completo"
                    required
                    value={nombreCompleto}
                    onChange={(e) => setNombreCompleto(e.target.value)}
                  />
                </div>
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
                    placeholder="Mínimo 6 caracteres"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Registrando..." : "Crear Cuenta"}
                </Button>
                <p className="text-center text-sm text-gray-600">
                  ¿Ya tienes cuenta?{" "}
                  <button
                    type="button"
                    onClick={() => router.push("/auth/login")}
                    className="text-blue-600 hover:underline"
                  >
                    Inicia sesión
                  </button>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
