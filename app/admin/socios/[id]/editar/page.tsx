"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface SocioData {
  id: string
  nombre: string
  cuota_social: number
  profiles: {
    nombre_completo: string
    email: string
    dni: string
    telefono: string | null
  }
}

export default function EditarSocioPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const grupoId = params.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [socioData, setSocioData] = useState<SocioData | null>(null)
  const [disciplinas, setDisciplinas] = useState<Array<{ id: string; nombre: string }>>([])
  const [miembros, setMiembros] = useState<Array<any>>([])
  const [formData, setFormData] = useState({
    email: "",
    nombre_grupo: "",
    nombre_completo: "",
    dni: "",
    telefono: "",
    cuota_social: "",
  })

  useEffect(() => {
    fetchSocioData()
  }, [grupoId])

  async function fetchSocioData() {
    try {
      const response = await fetch(`/api/admin/socios/${grupoId}`)
      if (!response.ok) {
        throw new Error("Error al cargar los datos del socio")
      }
      const data = await response.json()
      setSocioData(data)
      // preparar miembros con disciplinas
      const miembrosData = (data.miembros_familia || []).map((m: any) => ({
        id: m.id,
        nombre_completo: m.nombre_completo,
        dni: m.dni,
        parentesco: m.parentesco,
        disciplinas: (m.inscripciones || []).map((i: any) => i.disciplina_id),
      }))
      setMiembros(miembrosData)
      // obtener disciplinas
      try {
        const resp = await fetch(`/api/admin/disciplinas`)
        const d = await resp.json()
        setDisciplinas(d)
      } catch (e) {
        console.warn("No se pudieron cargar disciplinas", e)
      }
      setFormData({
        email: data.profiles?.email || "",
        nombre_grupo: data.nombre,
        nombre_completo: data.profiles?.nombre_completo || "",
        dni: data.profiles?.dni || "",
        telefono: data.profiles?.telefono || "",
        cuota_social: data.cuota_social.toString(),
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      })
      router.push("/admin/socios")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const response = await fetch(`/api/admin/socios/${grupoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          nombre_grupo: formData.nombre_grupo,
          nombre_completo: formData.nombre_completo,
          dni: formData.dni,
          telefono: formData.telefono,
          cuota_social: Number.parseFloat(formData.cuota_social),
          miembros: miembros,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al actualizar socio")
      }

      toast({
        title: "Éxito",
        description: "Socio actualizado correctamente",
      })

      router.push("/admin/socios")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Editar Socio</CardTitle>
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

            {/* Miembros del grupo: editar nombre/dni/parentesco y asignar disciplinas */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-[#1e3a8a] mb-3">Miembros del Grupo Familiar</h3>

              {miembros.map((m, idx) => (
                <div key={m.id || idx} className="mb-3 p-3 bg-slate-50 rounded-md border">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <Label>Nombre</Label>
                      <Input value={m.nombre_completo} onChange={(e) => {
                        const copy = [...miembros]; copy[idx].nombre_completo = e.target.value; setMiembros(copy)
                      }} />
                    </div>
                    <div>
                      <Label>DNI</Label>
                      <Input value={m.dni} onChange={(e) => { const copy = [...miembros]; copy[idx].dni = e.target.value; setMiembros(copy) }} />
                    </div>
                    <div>
                      <Label>Parentesco</Label>
                      <Input value={m.parentesco || ""} onChange={(e) => { const copy = [...miembros]; copy[idx].parentesco = e.target.value; setMiembros(copy) }} />
                    </div>
                  </div>

                  <div className="mt-3">
                    <Label>Disciplinas</Label>
                    <select multiple value={m.disciplinas || []} onChange={(e) => {
                      const options = Array.from(e.target.selectedOptions).map(o => o.value)
                      const copy = [...miembros]; copy[idx].disciplinas = options; setMiembros(copy)
                    }} className="w-full border rounded p-2">
                      {disciplinas.map((d) => (
                        <option key={d.id} value={d.id}>{d.nombre}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mt-3 flex justify-end">
                    <Button variant="destructive" size="sm" onClick={() => { setMiembros(miembros.filter((_, i) => i !== idx)) }}>Eliminar</Button>
                  </div>
                </div>
              ))}

              <div>
                <Button type="button" onClick={() => setMiembros([...miembros, { nombre_completo: "", dni: "", parentesco: "", disciplinas: [] }])} className="mt-2">Agregar Miembro</Button>
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isSaving} className="bg-[#1e3a8a] hover:bg-[#1e40af]">
                {isSaving ? "Guardando..." : "Guardar Cambios"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
