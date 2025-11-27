"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface NuevoAdminFormProps {
  // Define props if any, for example, if you need to pass initial data
}

export function NuevoAdminForm({}: NuevoAdminFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    nombre_completo: "",
    email: "",
    rol: "admin_disciplina", // default role
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/admin/admins/crear", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al crear el administrador")
      }

      toast({
        title: "Administrador creado exitosamente",
      })

      router.push("/admin/admins") // Redirect to the admins list
      router.refresh() // Refresh the page to show the new admin
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crear Nuevo Administrador</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="nombre_completo">Nombre Completo *</Label>
              <Input
                id="nombre_completo"
                required
                value={formData.nombre_completo}
                onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rol">Rol *</Label>
              <Select
                required
                value={formData.rol}
                onValueChange={(value) => setFormData({ ...formData, rol: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin_disciplina">Administrador de Disciplina</SelectItem>
                  <SelectItem value="super_admin">Super Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña *</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white"
            >
              {isLoading ? "Creando..." : "Crear Administrador"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="border-[#1e3a8a] text-[#1e3a8a] hover:bg-[#1e3a8a]/5"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
