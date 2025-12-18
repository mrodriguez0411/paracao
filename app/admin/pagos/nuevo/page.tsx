'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, ArrowLeft, Save, AlertTriangle, CheckCircle } from "lucide-react"
import Link from "next/link"
import ReciboFinal from '@/components/recibos/ReciboFinal'

// --- TYPE DEFINITIONS ---
type Socio = {
  id: string
  nombre: string
  titular: { nombre_completo: string; email: string; dni: string; }
  total_general: number
}

type Cuota = {
  id: string
  mes: number
  anio: number
  monto: number
  tipo: 'social' | 'deportiva'
  descripcion: string
  pagada: boolean
  fecha_pago?: string
}

type Pago = { id: string; monto: number; fecha_pago: string; tipo_pago: string; }

type TipoPago = 'efectivo' | 'transferencia' | 'tarjeta' | 'otro'

// --- COMPONENT START ---
export default function NuevoPagoPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const socioId = searchParams.get('socio_id') || searchParams.get('id')
  const supabase = createClient()

  // --- STATE MANAGEMENT ---
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [socio, setSocio] = useState<Socio | null>(null)
  const [todasLasCuotas, setTodasLasCuotas] = useState<Cuota[]>([])
  const [selectedCuotas, setSelectedCuotas] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [showRecibo, setShowRecibo] = useState(false)
  const [pagoRealizado, setPagoRealizado] = useState<Pago | null>(null)

  const [formData, setFormData] = useState({ fecha_pago: new Date().toISOString().split('T')[0], tipo_pago: 'efectivo' as TipoPago, notas: '' })

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchData = async () => {
      if (!socioId) {
        setError('No se ha especificado un socio');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch(`/api/admin/socios/${socioId}/cuotas?t=${new Date().getTime()}`, { headers: { 'Authorization': `Bearer ${session?.access_token}` } });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || `Error al cargar los datos (${res.status})`);
        }
        const data = await res.json();
        setSocio(data.grupo);
        setTodasLasCuotas(data.cuotas || []); // Changed from cuotasPendientes to todasLasCuotas
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar la información');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [socioId]);

  // --- MEMOIZED CALCULATIONS ---
  const totalAPagar = useMemo(() => {
    return todasLasCuotas
      .filter(cuota => selectedCuotas.includes(cuota.id))
      .reduce((sum, cuota) => sum + (cuota.monto || 0), 0);
  }, [selectedCuotas, todasLasCuotas]);

  // --- EVENT HANDLERS ---
  const handleSelectionChange = (cuotaId: string) => {
    setSelectedCuotas(prev =>
      prev.includes(cuotaId) ? prev.filter(id => id !== cuotaId) : [...prev, cuotaId]
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSelectChange = (name: string, value: string) => setFormData(prev => ({ ...prev, [name]: value as TipoPago }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCuotas.length === 0) {
      setError('Debes seleccionar al menos una cuota para pagar.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const payload = { fecha_pago: formData.fecha_pago, tipo_pago: formData.tipo_pago, cuotaIds: selectedCuotas };
      const res = await fetch(`/api/admin/pagos`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` }, body: JSON.stringify(payload) });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.details || errorData.error || 'Error al registrar el pago');
      }
      const result = await res.json();
      if (!result.updatedCuotas) throw new Error('La API no devolvió una confirmación.');
      const pagoParaRecibo: Pago = { id: result.updatedCuotas[0].id, monto: totalAPagar, fecha_pago: formData.fecha_pago, tipo_pago: formData.tipo_pago };
      setPagoRealizado(pagoParaRecibo);
      setShowRecibo(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setSaving(false);
    }
  };

  const handleCloseRecibo = () => {
    setShowRecibo(false);
    router.push(`/admin/socios/${socioId}?refresh=${new Date().getTime()}#cuotas`);
  };
  
  const cuotasPendientes = useMemo(() => todasLasCuotas.filter(c => !c.pagada), [todasLasCuotas]);

  // --- RENDER LOGIC ---
  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-blue-800" /><span className="ml-2">Cargando...</span></div>;
  if (showRecibo && pagoRealizado && socio) {
    const cuotasParaRecibo = todasLasCuotas.filter(c => selectedCuotas.includes(c.id));
    return <ReciboFinal pagoData={{ grupo: socio, cuotasPagadas: cuotasParaRecibo }} nuevoPago={pagoRealizado} onClose={handleCloseRecibo} />;
  }
  if (error) return <div className="bg-red-50 border-l-4 border-red-400 p-4 text-red-700"><AlertTriangle className="inline h-5 w-5 mr-2" />{error}</div>;
  if (!socio) return <div className="text-center py-12"><h2 className="text-lg font-medium">No se encontró el socio</h2></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#efb600]">Nuevo Pago</h1>
          <p className="text-sm text-gray-400 mt-1">Para: {socio.titular.nombre_completo}</p>
        </div>
        <Button asChild variant="outline" className="border-[#1e3a8a] text-[#1e3a8a] hover:bg-[#efb600]/10 hover:text-[#1e3a8a]"><Link href={`/admin/socios/${socioId}`}><ArrowLeft className="h-4 w-4 mr-2" />Volver</Link></Button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Cuotas del Socio</CardTitle>
              <CardDescription>Selecciona las cuotas pendientes que deseas incluir en este pago.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todasLasCuotas.length > 0 ? (
                  todasLasCuotas.map((cuota) => (
                    <div key={cuota.id} className={`flex items-center justify-between p-3 rounded-md border ${cuota.pagada ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
                      <div className="flex items-center space-x-4">
                        <Checkbox id={cuota.id} checked={selectedCuotas.includes(cuota.id) || cuota.pagada} onCheckedChange={() => !cuota.pagada && handleSelectionChange(cuota.id)} disabled={cuota.pagada} />
                        <div>
                          <Label htmlFor={cuota.id} className={`font-medium ${cuota.pagada ? 'text-gray-500 line-through' : 'text-black'}`}>{cuota.descripcion}</Label>
                          {cuota.pagada && cuota.fecha_pago ? (
                            <p className="text-xs text-green-700 font-semibold flex items-center"><CheckCircle className="h-3 w-3 mr-1"/>Pagada el {new Date(cuota.fecha_pago).toLocaleDateString('es-AR')}</p>
                          ) : (
                            <p className="text-sm text-gray-500">Vencimiento: {cuota.mes}/{cuota.anio}</p>
                          )}
                        </div>
                      </div>
                      <span className={`font-semibold text-lg ${cuota.pagada ? 'text-gray-400 line-through' : 'text-black'}`}>${cuota.monto.toFixed(2)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-6">Este socio no tiene cuotas generadas.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Detalles del Pago</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="monto">Monto Total a Pagar</Label>
                <Input id="monto" type="text" value={`$ ${totalAPagar.toFixed(2)}`} readOnly className="text-2xl font-bold h-12 bg-gray-100 text-black" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fecha_pago">Fecha de Pago</Label>
                <Input className="text-black" id="fecha_pago" name="fecha_pago" type="date" value={formData.fecha_pago} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipo_pago">Método de Pago</Label>
                <Select value={formData.tipo_pago} onValueChange={(value) => handleSelectChange('tipo_pago', value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="efectivo">Efectivo</SelectItem><SelectItem value="transferencia">Transferencia</SelectItem><SelectItem value="tarjeta">Tarjeta</SelectItem><SelectItem value="otro">Otro</SelectItem></SelectContent></Select>
              </div>
               <div className="space-y-2">
                <Label htmlFor="notas">Notas (opcional)</Label>
                <textarea id="notas" name="notas" value={formData.notas} onChange={handleChange} rows={2} className="w-full rounded-md border bg-transparent px-3 py-2 text-sm" placeholder="Notas adicionales..." />
              </div>
            </CardContent>
          </Card>
          
          {error && <div className="bg-red-50 p-3 text-sm text-red-700 rounded-md"><AlertTriangle className="inline h-4 w-4 mr-1.5" />{error}</div>}

          {cuotasPendientes.length === 0 && todasLasCuotas.length > 0 && (
              <div className="bg-green-100 border-l-4 border-green-500 text-green-800 p-4 rounded-md">
                  <div className="flex"><div className="flex-shrink-0"><CheckCircle className="h-5 w-5 text-green-400"/></div><div className="ml-3"><h3 className="text-sm font-medium">¡Al día!</h3><p className="text-sm">Este socio no tiene deudas pendientes.</p></div></div>
              </div>
          )}

          <Button type="submit" disabled={saving || totalAPagar === 0} className="w-full bg-[#efb600] hover:bg-[#d4a300] text-black text-lg py-6">
            {saving ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Procesando...</> : <><Save className="mr-2 h-5 w-5" />Registrar Pago</>}
          </Button>
        </div>
      </form>
    </div>
  );
}