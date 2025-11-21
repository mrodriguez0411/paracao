"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, PlusCircle, RefreshCw, Trash2, Save } from "lucide-react"

type TipoCuota = {
  id: string
  tipo: string
  nombre: string
  monto: number
  por_disciplina: boolean
  activo: boolean
}

const TIPOS = [
  { value: "gf1", label: "Grupo Familiar 1" },
  { value: "gf2", label: "Grupo Familiar 2" },
  { value: "individual", label: "Individual" },
  { value: "mayores", label: "Mayores" },
  { value: "deportiva", label: "Deportiva" },
]

export default function CuotasTiposPage() {
  const [tipos, setTipos] = useState<TipoCuota[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<Record<string, boolean>>({})

  const [form, setForm] = useState({
    tipo: "gf1",
    nombre: "Grupo Familiar 1",
    monto: "",
    por_disciplina: false,
    activo: true,
  })

  const load = async () => {
    setLoading(true)
    const res = await fetch("/api/admin/cuotas/tipos", { cache: "no-store" })
    const data = await res.json()
    const list = Array.isArray(data) ? data : []
    setTipos(list.filter((x: any) => x && x.id))
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      tipo: form.tipo,
      nombre: form.nombre,
      monto: Number(form.monto),
      por_disciplina: form.por_disciplina,
      activo: form.activo,
    }
    const res = await fetch("/api/admin/cuotas/tipos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      setForm({ tipo: "gf1", nombre: "Grupo Familiar 1", monto: "", por_disciplina: false, activo: true })
      load()
    } else {
      const err = await res.json()
      alert(err.error || "No se pudo crear")
    }
  }

  const handleUpdate = async (id: string, patch: Partial<TipoCuota>, showFeedback: boolean = true) => {
    if (!id) {
      alert("ID de tipo de cuota inválido")
      return false
    }
    
    setUpdating(prev => ({ ...prev, [id]: true }))
    
    try {
      const res = await fetch(`/api/admin/cuotas/tipos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      })
      
      if (!res.ok) {
        const err = await res.json()
        if (showFeedback) {
          alert(err.error || "No se pudo actualizar")
        }
        return false
      }
      
      if (showFeedback) {
        const successElement = document.createElement('div')
        successElement.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg'
        successElement.textContent = '¡Cambios guardados!'
        document.body.appendChild(successElement)
        
        setTimeout(() => {
          successElement.remove()
        }, 2000)
      }
      
      return true
    } catch (error) {
      console.error('Error al actualizar:', error)
      if (showFeedback) {
        alert('Error al conectar con el servidor')
      }
      return false
    } finally {
      setUpdating(prev => ({ ...prev, [id]: false }))
      load()
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between" >
        <div >
          <h1 className="text-2xl font-bold" style={{ color: "#EFB600" }}>Tipos de Cuota</h1>
          <p className="text-sm " style={{ color: "#EFB600" }}>Administra los diferentes tipos de cuotas para los socios</p>
        </div>
        <Button onClick={load} variant="outline" size="sm" style={{backgroundColor: "#efb600", color: "#1e3a8a" }}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-[#1e3a8a]">Nuevo Tipo de Cuota</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo</Label>
                <Input
                  id="tipo"
                  value={form.tipo}
                  onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                  placeholder="Ej: gf1, individual"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Ej: Grupo Familiar 1"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="monto">Monto (ARS)</Label>
                <Input
                  id="monto"
                  type="number"
                  step="0.01"
                  value={form.monto}
                  onChange={(e) => setForm({ ...form, monto: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="flex items-end space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="por_disciplina"
                    checked={form.por_disciplina}
                    onCheckedChange={(checked) => setForm({ ...form, por_disciplina: Boolean(checked) })}
                  />
                  <Label htmlFor="por_disciplina" className="text-sm">
                    Por disciplina
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="activo"
                    checked={form.activo}
                    onCheckedChange={(checked) => setForm({ ...form, activo: Boolean(checked) })}
                  />
                  <Label htmlFor="activo" className="text-sm">
                    Activo
                  </Label>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" className="bg-[#1e3a8a] hover:bg-[#1e3a8a]/90" style={{backgroundColor: "#efb600", color: "#1e3a8a" }}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Agregar Tipo de Cuota
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tipos de Cuota Existentes</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-[#1e3a8a]" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1e3a8a]/20">
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#1e3a8a]">Tipo</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#1e3a8a]">Nombre</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-[#1e3a8a]">Monto</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-[#1e3a8a]">Por Disciplina</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-[#1e3a8a]">Estado</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-[#1e3a8a]">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e3a8a]/10">
                  {tipos.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500">
                        No hay tipos de cuota configurados
                      </td>
                    </tr>
                  ) : (
                    tipos.map((tipo) => (
                      <tr key={tipo.id} className="hover:bg-[#EFB600]/10 [&>td]:text-gray-800 [&>td]:hover:text-[#1e3a8a] transition-colors">
                        <td className="py-3 px-4 text-sm text-gray-800">{tipo.tipo}</td>
                        <td className="py-3 px-4">
                          <Input
                            name={`nombre-${tipo.id}`}
                            className="w-full"
                            defaultValue={tipo.nombre}
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end">
                            <span className="text-sm text-gray-500 mr-1">$</span>
                            <Input
                              name={`monto-${tipo.id}`}
                              type="number"
                              step="0.01"
                              className="w-32 text-right"
                              defaultValue={tipo.monto}
                            />
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Checkbox
                            name={`por_disciplina-${tipo.id}`}
                            defaultChecked={tipo.por_disciplina}
                          />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <label className="inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              name={`activo-${tipo.id}`}
                              defaultChecked={tipo.activo}
                              className="sr-only peer"
                            />
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              tipo.activo
                                ? 'bg-[#1e3a8a]/10 text-[#1e3a8a]'
                                : 'bg-[#EFB600]/20 text-[#8a6e1e]'
                            }`}>
                              {tipo.activo ? 'Activo' : 'Inactivo'}
                            </span>
                          </label>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-[#1e3a8a] border-[#1e3a8a] hover:bg-[#1e3a8a]/10 hover:text-[#1e3a8a]"
                              onClick={async () => {
                                const updated = await handleUpdate(tipo.id, {
                                  nombre: (document.querySelector(`input[name='nombre-${tipo.id}']`) as HTMLInputElement)?.value || tipo.nombre,
                                  monto: parseFloat((document.querySelector(`input[name='monto-${tipo.id}']`) as HTMLInputElement)?.value) || tipo.monto,
                                  por_disciplina: (document.querySelector(`input[name='por_disciplina-${tipo.id}']`) as HTMLInputElement)?.checked || tipo.por_disciplina,
                                  activo: (document.querySelector(`input[name='activo-${tipo.id}']`) as HTMLInputElement)?.checked || tipo.activo,
                                })
                                if (updated) {
                                  load()
                                }
                              }}
                              disabled={updating[tipo.id]}
                            >
                              {updating[tipo.id] ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Save className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:bg-red-50 hover:text-red-700"
                              onClick={async () => {
                                if (confirm("¿Estás seguro de eliminar este tipo de cuota?")) {
                                  await fetch(`/api/admin/cuotas/tipos/${tipo.id}`, {
                                    method: "DELETE",
                                  })
                                  load()
                                }
                              }}
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}