'use client'

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { X } from "lucide-react"

// --- Interfaces ---
interface Disciplina { id: string; nombre: string }
interface Actividad { id: string; nombre: string }
interface Miembro {
  id: string
  nombre: string
  apellido: string
  dni: string
  fecha_nacimiento: string
  parentesco?: string
  actividades: string[]
}
interface TipoCuota { id: string; nombre: string; monto: number }

// --- Helper ---
const calculateAge = (birthDate: string) => {
  if (!birthDate) return null
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

// --- Component ---
export function NuevoSocioForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  
  // --- State ---
  const [formData, setFormData] = useState({ email: "", password: "", nombre: "", apellido: "", dni: "", telefono: "", nombre_grupo: "", tipo_cuota_id: "", fecha_nacimiento: "" })
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([])
  const [allActividades, setAllActividades] = useState<Actividad[]>([]);
  const [tiposCuota, setTiposCuota] = useState<TipoCuota[]>([])

  // Titular state
  const [titularSelectedDisciplina, setTitularSelectedDisciplina] = useState("")
  const [titularActividades, setTitularActividades] = useState<Actividad[]>([])
  const [titularSelectedActividad, setTitularSelectedActividad] = useState("")
  const [titularInscripciones, setTitularInscripciones] = useState<string[]>([])

  // Miembros state
  const [miembros, setMiembros] = useState<Miembro[]>([])
  const [nuevoMiembro, setNuevoMiembro] = useState<Omit<Miembro, 'id'>>({ nombre: "", apellido: "", dni: "", parentesco: "", fecha_nacimiento: "", actividades: [] })
  const [miembroSelectedDisciplina, setMiembroSelectedDisciplina] = useState("")
  const [miembroActividades, setMiembroActividades] = useState<Actividad[]>([])
  const [miembroSelectedActividad, setMiembroSelectedActividad] = useState("")

  // --- Data Fetching ---
  useEffect(() => {
    const cargarDataInicial = async () => {
      try {
        const [discRes, cuotasRes, actRes] = await Promise.all([
          fetch("/api/admin/disciplinas"),
          fetch("/api/admin/cuotas/tipos", { cache: "no-store" }),
          fetch("/api/admin/actividades")
        ])
        
        if (!discRes.ok || !cuotasRes.ok || !actRes.ok) throw new Error('No se pudieron cargar los datos iniciales');

        const discData = await discRes.json()
        setDisciplinas(Array.isArray(discData) ? discData : [])

        const actData = await actRes.json()
        setAllActividades(Array.isArray(actData) ? actData : []);

        const cuotasData = await cuotasRes.json()
        const cuotasActivas = (Array.isArray(cuotasData) ? cuotasData : []).filter((t: any) => t.activo && !t.por_disciplina)
        setTiposCuota(cuotasActivas)
        if (cuotasActivas.length > 0) {
          setFormData((fd) => ({ ...fd, tipo_cuota_id: cuotasActivas[0].id }))
        }
      } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive" })
      }
    }
    cargarDataInicial()
  }, [toast])

  // --- Effects for loading actividades ---
  useEffect(() => {
    setTitularActividades([]);
    setTitularSelectedActividad('');
    if (titularSelectedDisciplina) {
      fetch(`/api/admin/disciplinas/${titularSelectedDisciplina}/actividades`).then(res => res.json()).then(data => setTitularActividades(data)).catch(() => {});
    }
  }, [titularSelectedDisciplina]);

  useEffect(() => {
    setMiembroActividades([]);
    setMiembroSelectedActividad('');
    if (miembroSelectedDisciplina) {
      fetch(`/api/admin/disciplinas/${miembroSelectedDisciplina}/actividades`).then(res => res.json()).then(data => setMiembroActividades(data)).catch(() => {});
    }
  }, [miembroSelectedDisciplina]);

  // --- Handlers ---
  const handleAddTitularInscripcion = () => { if (titularSelectedActividad && !titularInscripciones.includes(titularSelectedActividad)) setTitularInscripciones([...titularInscripciones, titularSelectedActividad]); setTitularSelectedActividad(""); }
  const handleAddMiembroInscripcion = () => { if (miembroSelectedActividad && !nuevoMiembro.actividades?.includes(miembroSelectedActividad)) setNuevoMiembro({ ...nuevoMiembro, actividades: [...(nuevoMiembro.actividades || []), miembroSelectedActividad] }); setMiembroSelectedActividad(""); }
  const handleAddMiembro = () => {
    if (!nuevoMiembro.nombre.trim() || !nuevoMiembro.apellido.trim() || !nuevoMiembro.dni.trim()) return toast({ title: "Atención", description: "El nombre, apellido y DNI del miembro son obligatorios.", variant: "destructive" });
    setMiembros([...miembros, { ...nuevoMiembro, id: String(Date.now()) }])
    setNuevoMiembro({ nombre: '', apellido: '', dni: '', parentesco: '', fecha_nacimiento: '', actividades: [] })
    setMiembroSelectedDisciplina(""); setMiembroSelectedActividad("");
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsLoading(true);
    try {
      const response = await fetch("/api/admin/crear-socio", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...formData, titular_actividades: titularInscripciones, miembros }) });
      if (!response.ok) throw new Error((await response.json()).error || "Error al crear el socio");
      toast({ title: "Socio creado exitosamente" }); router.push("/admin/socios"); router.refresh();
    } catch (error: any) { toast({ title: "Error", description: error.message, variant: "destructive" }) }
    finally { setIsLoading(false) }
  }
  
  const titularAge = calculateAge(formData.fecha_nacimiento);
  const nuevoMiembroAge = calculateAge(nuevoMiembro.fecha_nacimiento);

  // --- RENDER ---
  return (
    <Card className="border-gray-100 shadow-sm rounded-xl overflow-hidden">
      <CardHeader><CardTitle className="text-[#1e3a8a]">Datos del Socio Titular</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="nombre">Nombre *</Label><Input id="nombre" required value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}/></div>
            <div className="space-y-2"><Label htmlFor="apellido">Apellido *</Label><Input id="apellido" required value={formData.apellido} onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}/></div>
            <div className="space-y-2"><Label htmlFor="email">Email *</Label><Input id="email" type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></div>
            <div className="space-y-2"><Label htmlFor="password">Contraseña *</Label><Input id="password" type="password" required minLength={6} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}/></div>
            <div className="space-y-2"><Label htmlFor="dni">DNI *</Label><Input id="dni" type="text" required placeholder="Ej: 12345678" value={formData.dni} onChange={(e) => setFormData({ ...formData, dni: e.target.value })}/></div>
            <div className="space-y-2"><Label htmlFor="telefono">Teléfono</Label><Input id="telefono" type="tel" value={formData.telefono} onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}/></div>
            <div className="space-y-2"><Label htmlFor="nombre_grupo">Nombre Grupo Familiar *</Label><Input id="nombre_grupo" required placeholder="Ej: Familia García" value={formData.nombre_grupo} onChange={(e) => setFormData({ ...formData, nombre_grupo: e.target.value })}/></div>
            <div className="space-y-2"><Label htmlFor="fecha_nacimiento">Fecha de Nacimiento</Label><Input id="fecha_nacimiento" type="date" value={formData.fecha_nacimiento} onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}/></div>
            {titularAge !== null && <div className="space-y-2"><Label>Edad</Label><p className="p-2 h-10 border rounded-md bg-slate-50 text-black">{titularAge} años</p></div>}
            <div className="space-y-2 md:col-span-2"><Label htmlFor="tipo_cuota_id">Tipo de Cuota *</Label><select id="cuota_social" required className="w-full border rounded p-2 text-black" value={formData.tipo_cuota_id} onChange={(e) => setFormData({...formData, tipo_cuota_id: e.target.value})}><option value="">Seleccioná un tipo de cuota</option>{tiposCuota.map((t) => <option key={t.id} value={t.id}>{t.nombre} - ${t.monto}</option>)}</select></div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-[#1e3a8a] mb-3">Inscripciones del Titular</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-2">
               <select value={titularSelectedDisciplina} onChange={(e) => setTitularSelectedDisciplina(e.target.value)} className="w-full border rounded p-2 text-black"><option value="">1. Elegí Disciplina</option>{disciplinas.map((d) => <option key={d.id} value={d.id}>{d.nombre}</option>)}</select>
              <select value={titularSelectedActividad} onChange={(e) => setTitularSelectedActividad(e.target.value)} className="w-full border rounded p-2 text-black" disabled={!titularSelectedDisciplina || titularActividades.length === 0}><option value="">{titularSelectedDisciplina ? (titularActividades.length > 0 ? "2. Elegí Actividad" : "No hay actividades") : "..."}</option>{titularActividades.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}</select>
              <Button type="button" className="bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white" onClick={handleAddTitularInscripcion}>Agregar</Button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">{titularInscripciones.map(actId => { const act = allActividades.find(a => a.id === actId); return <span key={actId} className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-sm">{act?.nombre || actId}<button type="button" className="ml-1 text-blue-800/70 hover:text-blue-900" onClick={() => setTitularInscripciones(titularInscripciones.filter(id => id !== actId))}>×</button></span>}) }</div>
          </div>

          <div className="border-t pt-6">
             <h3 className="text-lg font-semibold text-[#1e3a8a] mb-4">Miembros del Grupo Familiar</h3>
             <div className="bg-slate-50 p-4 rounded-lg mb-4 space-y-4">
                <div className="grid gap-4 md:grid-cols-3"><div className="space-y-2"><Label className="text-black">Nombre *</Label><Input value={nuevoMiembro.nombre} onChange={(e) => setNuevoMiembro({...nuevoMiembro, nombre: e.target.value})} /></div><div className="space-y-2"><Label className="text-black">Apellido *</Label><Input value={nuevoMiembro.apellido} onChange={(e) => setNuevoMiembro({...nuevoMiembro, apellido: e.target.value})} /></div><div className="space-y-2"><Label className="text-black">DNI *</Label><Input value={nuevoMiembro.dni} onChange={(e) => setNuevoMiembro({...nuevoMiembro, dni: e.target.value})} /></div><div className="space-y-2"><Label className="text-black">Parentesco</Label><Input value={nuevoMiembro.parentesco} onChange={(e) => setNuevoMiembro({...nuevoMiembro, parentesco: e.target.value})} /></div></div>
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2"><Label className="text-black">Fecha de Nacimiento</Label><Input type="date" value={nuevoMiembro.fecha_nacimiento} onChange={(e) => setNuevoMiembro({...nuevoMiembro, fecha_nacimiento: e.target.value})} /></div>
                    {nuevoMiembroAge !== null && <div className="space-y-2"><Label className="text-black">Edad</Label><p className="p-2 h-10 border rounded-md bg-white text-black">{nuevoMiembroAge} años</p></div>}
                </div>
                <div>
                  <Label className="text-black font-medium">Inscripciones</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-2 mt-1">
                    <select value={miembroSelectedDisciplina} onChange={(e) => setMiembroSelectedDisciplina(e.target.value)} className="w-full border rounded p-2 text-black"><option value="">1. Elegí Disciplina</option>{disciplinas.map((d) => <option key={d.id} value={d.id}>{d.nombre}</option>)}</select>
                    <select value={miembroSelectedActividad} onChange={(e) => setMiembroSelectedActividad(e.target.value)} className="w-full border rounded p-2 text-black" disabled={!miembroSelectedDisciplina || miembroActividades.length === 0}><option value="">{miembroSelectedDisciplina ? (miembroActividades.length > 0 ? "2. Elegí Actividad" : "No hay actividades") : "..."}</option>{miembroActividades.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}</select>
                    <Button type="button" className="bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white" onClick={handleAddMiembroInscripcion}>Agregar</Button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">{(nuevoMiembro.actividades || []).map(actId => { const act = allActividades.find(a => a.id === actId); return <span key={actId} className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-sm">{act?.nombre || actId}<button type="button" className="ml-1 text-blue-800/70 hover:text-blue-900" onClick={() => setNuevoMiembro({...nuevoMiembro, actividades: nuevoMiembro.actividades.filter(id => id !== actId)})}>×</button></span>}) }</div>
                </div>
                <Button type="button" onClick={handleAddMiembro} className="w-full bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white">Agregar Miembro</Button>
             </div>
             {miembros.length > 0 && <div className="space-y-2"><p className="font-medium text-[#1e3a8a]">Miembros agregados:</p>{miembros.map(miembro => (<div key={miembro.id} className="flex items-center justify-between bg-slate-100 p-3 rounded-lg"><div><p className="font-semibold text-gray-800">{miembro.nombre} {miembro.apellido} <span className="font-normal text-gray-600">({miembro.parentesco})</span></p><p className="text-sm text-gray-600">DNI: {miembro.dni}</p><div className="text-sm text-gray-500">Actividades: {miembro.actividades.map(id => allActividades.find(a => a.id === id)?.nombre || id).join(", ") || "Ninguna"}</div></div><Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => setMiembros(miembros.filter(m => m.id !== miembro.id))}><X size={18} /></Button></div>))}</div>}
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading} className="bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white">{isLoading ? "Creando..." : "Crear Socio"}</Button>
            <Button type="button" variant="outline" className="border-[#1e3a8a] text-[#1e3a8a]" onClick={() => router.back()}>Cancelar</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
