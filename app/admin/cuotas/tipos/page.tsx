"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
// usando input type="checkbox" nativo para evitar dependencia faltante

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
    setTipos(Array.isArray(data) ? data : [])
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

  const handleUpdate = async (id: string, patch: Partial<TipoCuota>) => {
    const res = await fetch(`/api/admin/cuotas/tipos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    })
    if (!res.ok) {
      const err = await res.json()
      alert(err.error || "No se pudo actualizar")
    } else {
      load()
    }
  }

  const handleTipoChange = (value: string) => {
    const preset = TIPOS.find(t => t.value === value)
    setForm((f) => ({ ...f, tipo: value, nombre: preset ? preset.label : f.nombre }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight" style={{ color: "#efb600" }}>Tipos de Cuota</h2>
        <p style={{ color: "#efb600" }}>Define los montos que usará la generación mensual</p>
      </div>

      <Card className="p-4 bg-white/80 backdrop-blur border border-[#1e3a8a]/20">
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <div className="md:col-span-2">
            <label className="text-sm text-gray-700">Tipo</label>
            <select
              value={form.tipo}
              onChange={(e) => handleTipoChange(e.target.value)}
              className="w-full h-10 rounded-md border px-3"
            >
              {TIPOS.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="text-sm text-gray-700">Nombre</label>
            <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          </div>
          <div className="md:col-span-1">
            <label className="text-sm text-gray-700">Monto (ARS)</label>
            <Input type="number" step="0.01" value={form.monto} onChange={(e) => setForm({ ...form, monto: e.target.value })} />
          </div>
          <div className="md:col-span-1 flex items-end gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={form.por_disciplina} onChange={(e) => setForm({ ...form, por_disciplina: e.target.checked })} />
              Por disciplina
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={form.activo} onChange={(e) => setForm({ ...form, activo: e.target.checked })} />
              Activo
            </label>
          </div>
          <div className="md:col-span-6 flex justify-end">
            <Button type="submit" className="bg-[#efb600] hover:bg-[#efb600]/90 text-[#1e3a8a]">Agregar</Button>
          </div>
        </form>
      </Card>

      <Card className="border border-gray-100 shadow-sm rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white border-b border-gray-100">
              <tr>
                <th className="text-left text-gray-500 font-medium text-[11px] tracking-wider uppercase py-3 pl-6">Tipo</th>
                <th className="text-left text-gray-500 font-medium text-[11px] tracking-wider uppercase py-3">Nombre</th>
                <th className="text-left text-gray-500 font-medium text-[11px] tracking-wider uppercase py-3">Monto (ARS)</th>
                <th className="text-left text-gray-500 font-medium text-[11px] tracking-wider uppercase py-3">Por Disciplina</th>
                <th className="text-left text-gray-500 font-medium text-[11px] tracking-wider uppercase py-3">Activo</th>
                <th className="text-right text-gray-500 font-medium text-[11px] tracking-wider uppercase py-3 pr-6">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={6} className="p-6 text-center text-gray-500">Cargando...</td></tr>
              )}
              {!loading && tipos.map((t) => (
                <tr key={t.id} className="border-b border-gray-50 last:border-0">
                  <td className="py-3 pl-6 text-sm text-gray-800">{t.tipo}</td>
                  <td className="py-3 text-sm text-gray-800">
                    <Input defaultValue={t.nombre} onBlur={(e) => handleUpdate(t.id, { nombre: e.target.value })} />
                  </td>
                  <td className="py-3 text-sm text-gray-800">
                    <Input type="number" step="0.01" defaultValue={t.monto} onBlur={(e) => handleUpdate(t.id, { monto: Number(e.target.value) })} />
                  </td>
                  <td className="py-3 text-sm text-gray-800">
                    <input type="checkbox" defaultChecked={t.por_disciplina} onChange={(e) => handleUpdate(t.id, { por_disciplina: e.target.checked })} />
                  </td>
                  <td className="py-3 text-sm text-gray-800">
                    <input type="checkbox" defaultChecked={t.activo} onChange={(e) => handleUpdate(t.id, { activo: e.target.checked })} />
                  </td>
                  <td className="py-3 pr-6 text-right">
                    <Button size="sm" variant="outline" onClick={() => handleUpdate(t.id, {})}>Guardar</Button>
                  </td>
                </tr>
              ))}
              {!loading && tipos.length === 0 && (
                <tr><td colSpan={6} className="p-6 text-center text-gray-500">No hay tipos configurados</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
