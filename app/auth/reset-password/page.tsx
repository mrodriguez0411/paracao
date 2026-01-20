'use client'

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/portal/change-password`,
    })

    setIsSubmitting(false)

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Correo enviado",
        description: "Revisa tu correo para encontrar el enlace y restablecer tu contraseña.",
      })
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-textura-azul bg-fixed">
      <div className="w-full max-w-sm">
        <Card className="bg-textura-amarilla border-0 shadow-lg rounded-lg pb-6">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-4xl font-oswald font-bold text-[#1e3a8a] mb-2">Club Paracao</CardTitle>
            <CardDescription className="text-[#1e3a8a] text-base font-semibold">Restablecer Contraseña</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
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
                <Button type="submit" className="w-full bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white font-semibold text-lg py-6" disabled={isSubmitting}>
                  {isSubmitting ? "Enviando..." : "Enviar correo de recuperación"}
                </Button>
                <Button asChild variant="outline" className="w-full border-[#1e3a8a] text-[#1e3a8a] hover:bg-[#1e3a8a]/5 font-semibold py-6">
                  <Link href="/auth/login">Volver al inicio de sesión</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
