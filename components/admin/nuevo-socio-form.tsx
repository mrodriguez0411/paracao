"use client"

import type React from "react"

import { useEffect, useState } from "react"
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
  parentesco?: string
  disciplinas?: string[]
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
    parentesco: "",
  })
  const [disciplinas, setDisciplinas] = useState<Array<{ id: string; nombre: string }>>([])
  const [titularDisciplinas, setTitularDisciplinas] = useState<string[]>([])
  const [titularDiscSelect, setTitularDiscSelect] = useState<string>("")
  const [miembroDiscSelect, setMiembroDiscSelect] = useState<Record<string, string>>({})

  useEffect(() => {
    const cargarDisciplinas = async () => {
      try {
        const res = await fetch("/api/admin/disciplinas")
        const data = await res.json()
        setDisciplinas(Array.isArray(data) ? data : [])
      } catch (e) {
        // noop
      }
    }
    cargarDisciplinas()
  }, [])

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
          titular_disciplinas: titularDisciplinas,
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
    <Card className="border border-gray-100 shadow-sm rounded-xl overflow-hidden">
      <CardHeader>
        <CardTitle className="text-[#1e3a8a]">Datos del Socio</CardTitle>
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

          {/* Disciplinas del Titular */}
          <div className="border-t pt-6 mt-6">
            <h3 className="text-lg font-semibold text-[#1e3a8a] mb-3">Disciplinas del Titular</h3>
            <div className="flex items-center gap-2">
              <select
                value={titularDiscSelect}
                onChange={(e) => setTitularDiscSelect(e.target.value)}
                className="flex-1 border rounded p-2 text-black"
              >
                <option value="">Seleccioná una disciplina</option>
                {disciplinas.map((d) => (
                  <option key={d.id} value={d.id}>{d.nombre}</option>
                ))}
              </select>
              <Button
                type="button"
                className="bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white"
                onClick={() => {
                  if (!titularDiscSelect) return
                  if (!titularDisciplinas.includes(titularDiscSelect)) {
                    setTitularDisciplinas([...titularDisciplinas, titularDiscSelect])
                  }
                  setTitularDiscSelect("")
                }}
              >Agregar</Button>
            </div>
            {titularDisciplinas.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {titularDisciplinas.map((id) => {
                  const disc = disciplinas.find((d) => d.id === id)
                  return (
                    <span key={id} className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-sm">
                      {disc?.nombre || id}
                      <button
                        type="button"
                        className="text-blue-800/70 hover:text-blue-900"
                        onClick={() => setTitularDisciplinas(titularDisciplinas.filter((x) => x !== id))}
                        aria-label="Quitar"
                      >×</button>
                    </span>
                  )
                })}
              </div>
            )}
          </div>

          {/* Sección de Miembros Familiares */}
          <div className="border-t pt-6 mt-6">
            <h3 className="text-lg font-semibold text-[#1e3a8a] mb-4">Miembros del Grupo Familiar</h3>
            
            {/* Formulario para agregar miembro */}
            <div className="bg-slate-50 p-4 rounded-lg mb-4 space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
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
                <div className="space-y-2">
                  <Label htmlFor="miembro_parentesco">Parentesco</Label>
                  <Input
                    id="miembro_parentesco"
                    placeholder="Ej: Hijo, Esposa, ..."
                    value={nuevoMiembro.parentesco}
                    onChange={(e) => setNuevoMiembro({ ...nuevoMiembro, parentesco: e.target.value })}
                  />
                </div>
              </div>

              {/* Disciplinas del nuevo miembro */}
              <div>
                <Label className="text-black font-bold">Disciplinas</Label>
                <div className="flex items-center gap-2 mt-1">
                  <select
                    value={miembroDiscSelect["nuevo"] || ""}
                    onChange={(e) => setMiembroDiscSelect({ ...miembroDiscSelect, ["nuevo"]: e.target.value })}
                    className="flex-1 border rounded p-2 text-black"
                  >
                    <option value="">Seleccioná una disciplina</option>
                    {disciplinas.map((d) => (
                      <option key={d.id} value={d.id}>{d.nombre}</option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    className="bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white"
                    onClick={() => {
                      const sel = miembroDiscSelect["nuevo"]
                      if (!sel) return
                      const actuales = (nuevoMiembro as any).disciplinas || []
                      if (!actuales.includes(sel)) {
                        (nuevoMiembro as any).disciplinas = [...actuales, sel]
                        setNuevoMiembro({ ...nuevoMiembro })
                      }
                      setMiembroDiscSelect({ ...miembroDiscSelect, ["nuevo"]: "" })
                    }}
                  >Agregar</Button>
                </div>
                {Array.isArray((nuevoMiembro as any).disciplinas) && (nuevoMiembro as any).disciplinas.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {((nuevoMiembro as any).disciplinas as string[]).map((id) => {
                      const disc = disciplinas.find((d) => d.id === id)
                      return (
                        <span key={id} className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-sm">
                          {disc?.nombre || id}
                          <button
                            type="button"
                            className="text-blue-800/70 hover:text-blue-900"
                            onClick={() => {
                              const arr = ((nuevoMiembro as any).disciplinas || []).filter((x: string) => x !== id)
                              ;(nuevoMiembro as any).disciplinas = arr
                              setNuevoMiembro({ ...nuevoMiembro })
                            }}
                            aria-label="Quitar"
                          >×</button>
                        </span>
                      )
                    })}
                  </div>
                )}
              </div>

              <Button
                type="button"
                onClick={() => {
                  if (nuevoMiembro.nombre_completo.trim() && nuevoMiembro.dni.trim()) {
                    const disciplinas = (nuevoMiembro as any).disciplinas || []
                    setMiembros([...miembros, { ...nuevoMiembro, disciplinas, id: String(Date.now()) }])
                    setNuevoMiembro({ nombre_completo: '', dni: '', parentesco: '' } as any)
                    setMiembroDiscSelect({ ...miembroDiscSelect, ["nuevo"]: "" })
                  }
                }}
                className="w-full bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white"
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
                        {Array.isArray(miembro.disciplinas) && miembro.disciplinas.length > 0 && (
                          <div className="mt-1 text-xs text-gray-600">Disciplinas: {miembro.disciplinas.map((id) => disciplinas.find((d) => d.id === id)?.nombre || id).join(", ")}</div>
                        )}
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
            <Button type="submit" disabled={isLoading} className="bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white">
              {isLoading ? "Creando..." : "Crear Socio"}
            </Button>
            <Button type="button" variant="outline" className="border-[#1e3a8a] text-[#1e3a8a] hover:bg-[#1e3a8a]/5" onClick={() => router.back()}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
