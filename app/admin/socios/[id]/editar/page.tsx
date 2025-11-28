"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface CuotaTipo {
  id: string
  nombre: string
  monto: number
  tipo: string
  activo: boolean
}

interface Miembro {
  id?: string
  nombre_completo: string
  dni: string
  parentesco: string
  disciplinas: string[]
}

export default function EditarSocioPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const grupoId = params.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [disciplinas, setDisciplinas] = useState<Array<{ id: string; nombre: string }>>([])
  const [tiposCuota, setTiposCuota] = useState<CuotaTipo[]>([])
  const [tiposLoading, setTiposLoading] = useState(false)
  const [miembros, setMiembros] = useState<Miembro[]>([])
  const [titularDisciplinas, setTitularDisciplinas] = useState<string[]>([])
  const [titularDiscSelect, setTitularDiscSelect] = useState<string>("")
  const [miembroDiscSelect, setMiembroDiscSelect] = useState<Record<number, string>>({})
  const [formData, setFormData] = useState({
    email: "",
    nombre_grupo: "",
    nombre_completo: "",
    dni: "",
    telefono: "",
    tipo_cuota_id: "",
    cuota_social: "",
  })

  const fetchSocioData = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/socios/${grupoId}`)
      if (!response.ok) throw new Error("Error al cargar los datos del socio")
      
      const socio = await response.json()

      setFormData({
        email: socio.profiles?.email || "",
        nombre_grupo: socio.nombre,
        nombre_completo: socio.profiles?.nombre_completo || "",
        dni: socio.profiles?.dni || "",
        telefono: socio.profiles?.telefono || "",
        tipo_cuota_id: socio.tipo_cuota_id || "",
        cuota_social: String(socio.cuotas_tipos?.monto ?? socio.cuota_social ?? ""),
      })

      const miembrosData = (socio.miembros_familia || []).map((m: any) => ({
        id: m.id,
        nombre_completo: m.nombre_completo,
        dni: m.dni,
        parentesco: m.parentesco,
        disciplinas: (m.inscripciones || []).map((i: any) => i.disciplina_id).filter(Boolean),
      }))
      setMiembros(miembrosData)

      const titularInsc = Array.isArray(socio.titular_inscripciones)
        ? socio.titular_inscripciones.map((i: any) => i.disciplina_id).filter(Boolean)
        : []
      setTitularDisciplinas(titularInsc)

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
  }, [grupoId, router, toast])

  useEffect(() => {
    const fetchAuxData = async () => {
      try {
        setTiposLoading(true)
        const [tiposRes, discRes] = await Promise.all([
          fetch('/api/admin/cuotas/tipos'),
          fetch('/api/admin/disciplinas')
        ])
        if (tiposRes.ok) setTiposCuota(await tiposRes.json())
        if (discRes.ok) setDisciplinas(await discRes.json())
      } catch (error) {
        toast({ title: "Error", description: "No se pudieron cargar datos auxiliares.", variant: "destructive" })
      } finally {
        setTiposLoading(false)
      }
    }
    
    fetchSocioData()
    fetchAuxData()
  }, [fetchSocioData, toast])

  const handleMiembroChange = (index: number, field: keyof Miembro, value: any) => {
    setMiembros(currentMiembros =>
      currentMiembros.map((miembro, i) =>
        i === index ? { ...miembro, [field]: value } : miembro
      )
    )
  }

  const handleAddDisciplinaMiembro = (index: number) => {
    const disciplinaId = miembroDiscSelect[index]
    if (!disciplinaId) return

    const miembro = miembros[index]
    const currentDisciplinas = miembro.disciplinas || []
    if (!currentDisciplinas.includes(disciplinaId)) {
      handleMiembroChange(index, 'disciplinas', [...currentDisciplinas, disciplinaId])
    }
    setMiembroDiscSelect(prev => ({ ...prev, [index]: "" }))
  }

  const handleRemoveDisciplinaMiembro = (miembroIndex: number, disciplinaId: string) => {
    const miembro = miembros[miembroIndex]
    const updatedDisciplinas = (miembro.disciplinas || []).filter(id => id !== disciplinaId)
    handleMiembroChange(miembroIndex, 'disciplinas', updatedDisciplinas)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const response = await fetch(`/api/admin/socios/${grupoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          cuota_social: Number.parseFloat(formData.cuota_social) || 0,
          miembros: miembros,
          titular_disciplinas: titularDisciplinas,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al actualizar socio")
      }

      toast({ title: "Éxito", description: "Socio actualizado correctamente" })
      router.push(`/admin/socios`) // Forzar recarga de la tabla
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
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card className="border border-gray-100 shadow-sm rounded-xl overflow-hidden">
        <CardHeader><CardTitle className="text-[#1e3a8a] text-center p-2 font-bold text-2xl">Editar Socio</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Formulario del titular... */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nombre_completo" className="text-black font-bold">Nombre Completo *</Label>
                <Input className="text-black" id="nombre_completo" required value={formData.nombre_completo} onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })}/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dni" className="text-black font-bold">DNI *</Label>
                <Input className="text-black" id="dni" type="text" required value={formData.dni} onChange={(e) => setFormData({ ...formData, dni: e.target.value })}/>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-black font-bold">Email *</Label>
              <Input className="text-black" id="email" type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}/>
            </div>
            {/* ... otros campos del titular ... */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="telefono" className="text-black font-bold">Teléfono</Label>
                <Input className="text-black" id="telefono" type="tel" value={formData.telefono} onChange={(e) => setFormData({ ...formData, telefono: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nombre_grupo" className="text-black font-bold">Nombre Grupo Familiar *</Label>
                <Input className="text-black" id="nombre_grupo" required value={formData.nombre_grupo} onChange={(e) => setFormData({ ...formData, nombre_grupo: e.target.value })} />
              </div>
            </div>
            {/* ... select de tipo de cuota y monto ... */}
            <div className="space-y-2">
              <Label htmlFor="tipo_cuota_id" className="text-gray-800 font-bold">Tipo de Cuota *</Label>
              <select id="tipo_cuota_id" className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900" value={formData.tipo_cuota_id} onChange={(e) => { const selected = tiposCuota.find(t => t.id === e.target.value); setFormData(prev => ({...prev, tipo_cuota_id: e.target.value, cuota_social: selected ? String(selected.monto) : ''}))}} required disabled={tiposLoading}>
                <option value="">Seleccionar tipo</option>
                {tiposCuota.map((tipo) => <option key={tipo.id} value={tipo.id}>{tipo.nombre} (${tipo.monto.toLocaleString('es-AR')})</option>)}
              </select>
            </div>
             <div className="space-y-2">
              <Label htmlFor="cuota_social" className="text-black font-bold">Monto de Cuota *</Label>
              <Input className="text-gray-900 bg-gray-100" id="cuota_social" type="number" step="0.01" required readOnly value={formData.cuota_social} />
            </div>

            {/* Disciplinas del Titular */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-[#1e3a8a] mb-3">Disciplinas del Titular</h3>
              {/* ... UI para disciplinas del titular ... */}
              <div className="flex items-center gap-2">
                <select value={titularDiscSelect} onChange={(e) => setTitularDiscSelect(e.target.value)} className="flex-1 border rounded p-2 text-black">
                  <option value="">Seleccioná una disciplina</option>
                  {disciplinas.map((d) => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                </select>
                <Button type="button" className="bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white" onClick={() => { if (titularDiscSelect && !titularDisciplinas.includes(titularDiscSelect)) { setTitularDisciplinas([...titularDisciplinas, titularDiscSelect]); } setTitularDiscSelect(""); }}>Agregar</Button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {titularDisciplinas.map((id) => {
                  const disc = disciplinas.find((d) => d.id === id);
                  return <span key={id} className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-sm">{disc?.nombre || id}<button type="button" className="text-blue-800/70 hover:text-blue-900" onClick={() => setTitularDisciplinas(titularDisciplinas.filter((x) => x !== id))} aria-label="Quitar">×</button></span>;
                })}
              </div>
            </div>

            {/* Miembros del grupo */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-[#1e3a8a] mb-3">Miembros del Grupo Familiar</h3>
              {miembros.map((m, idx) => (
                <div key={m.id || idx} className="mb-3 p-3 bg-slate-50 rounded-md border">
                  {/* Inputs para nombre, dni, parentesco */}
                  <div className="grid gap-4 md:grid-cols-3">
                    <div><Label className="text-black font-bold">Nombre</Label><Input className="text-black" value={m.nombre_completo} onChange={(e) => handleMiembroChange(idx, 'nombre_completo', e.target.value)} /></div>
                    <div><Label className="text-black font-bold">DNI</Label><Input className="text-black" value={m.dni} onChange={(e) => handleMiembroChange(idx, 'dni', e.target.value)} /></div>
                    <div><Label className="text-black font-bold">Parentesco</Label><Input className="text-black" value={m.parentesco || ""} onChange={(e) => handleMiembroChange(idx, 'parentesco', e.target.value)} /></div>
                  </div>

                  {/* UI para disciplinas de miembros */}
                  <div className="mt-3">
                    <Label className="text-black font-bold">Disciplinas</Label>
                    <div className="flex items-center gap-2">
                      <select value={miembroDiscSelect[idx] || ""} onChange={(e) => setMiembroDiscSelect({ ...miembroDiscSelect, [idx]: e.target.value })} className="flex-1 border rounded p-2 text-black">
                        <option value="">Seleccioná una disciplina</option>
                        {disciplinas.map((d) => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                      </select>
                      <Button type="button" className="bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white" onClick={() => handleAddDisciplinaMiembro(idx)}>Agregar</Button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(m.disciplinas || []).map((id) => {
                        const disc = disciplinas.find((d) => d.id === id);
                        return <span key={id} className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-sm">{disc?.nombre || id}<button type="button" className="text-blue-800/70 hover:text-blue-900" onClick={() => handleRemoveDisciplinaMiembro(idx, id)} aria-label="Quitar">×</button></span>;
                      })}
                    </div>
                  </div>
                  
                  <div className="mt-3 flex justify-end"><Button variant="destructive" size="sm" onClick={() => setMiembros(miembros.filter((_, i) => i !== idx))}>Eliminar Miembro</Button></div>
                </div>
              ))}
              <Button type="button" onClick={() => setMiembros([...miembros, { nombre_completo: "", dni: "", parentesco: "", disciplinas: [] }])} className="mt-2 bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white">Agregar Miembro</Button>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-4 pt-4 border-t">
              <Button type="submit" disabled={isSaving} className="bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white">{isSaving ? "Guardando..." : "Guardar Cambios"}</Button>
              <Button type="button" variant="outline" className="border-[#1e3a8a] text-[#1e3a8a] hover:bg-[#1e3a8a]/5" onClick={() => router.back()}>Cancelar</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
