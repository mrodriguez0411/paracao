'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export default function ChangePasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.")
      return
    }
    if (password.length < 6) {
        setError("La contraseña debe tener al menos 6 caracteres.")
        return
    }
    
    setError(null)
    setIsSubmitting(true)

    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })

    setIsSubmitting(false)

    if (updateError) {
      toast({
        title: "Error",
        description: updateError.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Éxito",
        description: "Tu contraseña ha sido actualizada. Serás redirigido al portal.",
      })
      router.push("/portal")
    }
  }

  // Este efecto maneja el evento onAuthStateChange para capturar la sesión del usuario
  // cuando es redirigido desde el enlace de correo electrónico.
  useEffect(() => {
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        // Aquí podrías hacer algo cuando el usuario llega a la página
        // desde el enlace de recuperación, pero para este caso no es necesario.
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-textura-azul bg-fixed">
      <div className="w-full max-w-sm">
        <Card className="bg-textura-amarilla border-0 shadow-lg rounded-lg pb-6">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-4xl font-oswald font-bold text-[#1e3a8a] mb-2">Club Paracao</CardTitle>
            <CardDescription className="text-[#1e3a8a] text-base font-semibold">Cambiar Contraseña</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="password" className="text-[#1e3a8a] font-semibold">Nueva Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="login-input border-[#1e3a8a]/30 focus:border-[#1e3a8a] focus:ring-[#1e3a8a] input-transparent text-black"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword" className="text-[#1e3a8a] font-semibold">Confirmar Nueva Contraseña</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="login-input border-[#1e3a8a]/30 focus:border-[#1e3a8a] focus:ring-[#1e3a8a] input-transparent text-black"
                  />
                </div>
                {error && <p className="text-sm text-red-600 font-semibold">{error}</p>}
                <Button type="submit" className="w-full bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white font-semibold text-lg py-6" disabled={isSubmitting}>
                  {isSubmitting ? "Actualizando..." : "Actualizar Contraseña"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
