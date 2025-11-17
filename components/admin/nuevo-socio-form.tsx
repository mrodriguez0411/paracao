"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { X } from "lucide-react"

interface Miembro {
  id: string
  nombre_completo: string
  dni: string
}

export function NuevoSocioForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    nombre_completo: "",
    dni: "",
    telefono: "",
    nombre_grupo: "",
    cuota_social: "",
  })
  const [miembros, setMiembros] = useState<Miembro[]>([])
  const [nuevoMiembro, setNuevoMiembro] = useState({
    nombre_completo: "",
    dni: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Usar endpoint del servidor que usa service-role para evitar restricciones de dominio
      const response = await fetch("/api/admin/crear-socio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          nombre_completo: formData.nombre_completo,
          dni: formData.dni,
          telefono: formData.telefono,
          nombre_grupo: formData.nombre_grupo,
          cuota_social: formData.cuota_social,
          miembros: miembros,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al crear socio")
      }

      const data = await response.json()

      toast({
        title: "Socio creado exitosamente",
        description: `Se ha creado el usuario ${data.email}`,
      })

      router.push("/admin/socios")
    } catch (error) {
      console.error("Error al crear socio:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al crear socio",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Datos del Socio</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
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
          </div>

          <div className="grid gap-4 md:grid-cols-2">
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
            <div className="space-y-2">
              <Label htmlFor="dni">DNI *</Label>
              <Input
                id="dni"
                type="text"
                required
                placeholder="Ej: 12345678"
                value={formData.dni}
                onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                type="tel"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nombre_grupo">Nombre Grupo Familiar *</Label>
              <Input
                id="nombre_grupo"
                required
                placeholder="Ej: Familia García"
                value={formData.nombre_grupo}
                onChange={(e) => setFormData({ ...formData, nombre_grupo: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cuota_social">Cuota Social Mensual *</Label>
              <Input
                id="cuota_social"
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={formData.cuota_social}
                onChange={(e) => setFormData({ ...formData, cuota_social: e.target.value })}
              />
            </div>
          </div>

          {/* Sección de Miembros Familiares */}
          <div className="border-t pt-6 mt-6">
            <h3 className="text-lg font-semibold text-[#1e3a8a] mb-4">Miembros del Grupo Familiar</h3>
            
            {/* Formulario para agregar miembro */}
            <div className="bg-slate-50 p-4 rounded-lg mb-4 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="miembro_nombre">Nombre Completo</Label>
                  <Input
                    id="miembro_nombre"
                    placeholder="Ej: María García"
                    value={nuevoMiembro.nombre_completo}
                    onChange={(e) => setNuevoMiembro({ ...nuevoMiembro, nombre_completo: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="miembro_dni">DNI</Label>
                  <Input
                    id="miembro_dni"
                    placeholder="Ej: 87654321"
                    value={nuevoMiembro.dni}
                    onChange={(e) => setNuevoMiembro({ ...nuevoMiembro, dni: e.target.value })}
                  />
                </div>
              </div>
              
              <Button
                type="button"
                onClick={() => {
                  if (nuevoMiembro.nombre_completo.trim() && nuevoMiembro.dni.trim()) {
                    setMiembros([...miembros, { ...nuevoMiembro, id: String(Date.now()) }])
                    setNuevoMiembro({ nombre_completo: '', dni: '' })
                  }
                }}
                className="w-full bg-[#1e3a8a] hover:bg-[#1e40af] text-white"
              >
                Agregar Miembro
              </Button>
            </div>

            {/* Lista de miembros agregados */}
            {miembros.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Miembros agregados ({miembros.length}):</p>
                <div className="space-y-2">
                  {miembros.map((miembro) => (
                    <div
                      key={miembro.id}
                      className="flex items-center justify-between bg-slate-100 p-3 rounded-lg border border-slate-200"
                    >
                      <div>
                        <p className="font-medium text-gray-800">{miembro.nombre_completo}</p>
                        <p className="text-sm text-gray-600 font-mono">DNI: {miembro.dni}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setMiembros(miembros.filter((m) => m.id !== miembro.id))}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creando..." : "Crear Socio"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
