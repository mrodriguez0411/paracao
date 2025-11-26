'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, ArrowLeft, Save, CreditCard, Users, User, Calendar, DollarSign, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import ReciboFinal from '@/components/recibos/ReciboFinal';

type Socio = {
  id: string
  nombre: string
  titular: {
    id: string
    nombre_completo: string
    email: string
    dni: string
  }
  tipo_cuota?: {
    id: string
    nombre: string
    monto: number
    tipo: string
    activo: boolean
  }
  cuota_social: number
  total_cuota_deportiva: number
  total_general: number
  disciplinas: Array<{
    id: string
    nombre: string
    monto: number;
    miembro_nombre: string;
  }>
}

type Pago = {
  id: string
  monto: number
  fecha_pago: string
  tipo_pago: string
  referencia?: string
  mes_anio_cuota: string
  notas?: string
  created_at: string
}

type ResumenPagos = {
  total_pagado: number
  total_pendiente: number
  ultimo_pago: {
    fecha: string
    monto: number
    mes_cuota: string
  } | null
}

type TipoPago = 'efectivo' | 'transferencia' | 'tarjeta' | 'otro'

export default function NuevoPagoPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const socioId = searchParams.get('socio_id') || searchParams.get('id')
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [socio, setSocio] = useState<Socio | null>(null)
  const [resumenPagos, setResumenPagos] = useState<ResumenPagos | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pagos, setPagos] = useState<Pago[]>([])
  const [showRecibo, setShowRecibo] = useState(false);
  const [pagoRealizado, setPagoRealizado] = useState(null);

  const [formData, setFormData] = useState({
    monto: '',
    fecha_pago: new Date().toISOString().split('T')[0],
    tipo_pago: 'efectivo' as TipoPago,
    referencia: '',
    mes_anio_cuota: new Date().toISOString().slice(0, 7) + '-01',
    notas: ''
  })

  useEffect(() => {
    const fetchData = async () => {
      if (!socioId) {
        setError('No se ha especificado un socio')
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        const { data: { session } } = await supabase.auth.getSession()
        const socioRes = await fetch(`/api/admin/socios/${socioId}/cuotas`, {
            headers: { 'Authorization': `Bearer ${session?.access_token}` }
        });

        if (!socioRes.ok) {
          const errorData = await socioRes.json();
          throw new Error(errorData.error || `Error al cargar los datos del socio (${socioRes.status})`)
        }

        const socioData = await socioRes.json();
        setSocio(socioData.grupo)
        setResumenPagos(socioData.resumen)
        if (socioData.grupo?.total_general) {
          setFormData(prev => ({ ...prev, monto: socioData.grupo.total_general.toString() }))
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar la información del socio')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [socioId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({...prev, [name]: value }))
  }

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!socioId) {
    setError('No se ha especificado un socio');
    return;
  }

  setSaving(true);
  setError(null);

  try {
    const { data: { session } } = await supabase.auth.getSession();
    const payload = {
      ...formData,
      monto: parseFloat(formData.monto),
    };

    const res = await fetch(`/api/admin/socios/${socioId}/pagos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Error al guardar el pago');
    }

    const result = await res.json();
    setPagoRealizado(result.pago);
    setShowRecibo(true);

  } catch (err) {
    setError(err instanceof Error ? err.message : 'Error al guardar el pago');
  } finally {
    setSaving(false);
  }
};

  const handleCloseRecibo = () => {
    setShowRecibo(false);
    router.push(`/admin/socios/${socioId}?tab=pagos`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-800" />
        <span className="ml-2">Cargando información del socio...</span>
      </div>
    )
  }

  if (showRecibo && pagoRealizado && socio) {
    return <ReciboFinal pagoData={{ grupo: socio }} nuevoPago={pagoRealizado} onClose={handleCloseRecibo} />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
            <div className="mt-4">
              <Link href="/admin/socios" className="inline-flex items-center text-sm font-medium text-red-600 hover:text-red-500">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Volver a la lista de socios
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!socio) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-medium text-gray-900">No se encontró el socio</h2>
        <p className="mt-2 text-sm text-gray-500">El socio solicitado no existe o no se pudo cargar su información.</p>
        <div className="mt-6">
          <Link href="/admin/socios" className="text-sm font-medium text-blue-600 hover:text-blue-500">
            <span aria-hidden="true">&larr;</span> Volver a la lista de socios
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#efb600" }}>Nuevo Pago</h1>
          <p className="text-sm text-gray-500 mt-1" style={{ color: "#efb600" }}>
            Registra un nuevo pago para {socio?.titular?.nombre_completo || '...'}
          </p>
        </div>
        <Button style={{ color: "#efb600" }}
          variant="outline" 
          asChild
          className="border-[#1e3a8a] text-[#1e3a8a] hover:bg-[#efb600]/10 hover:text-[#1e3a8a]"
        >
          <Link href={`/admin/socios/${socioId}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al detalle
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Resumen del socio */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Resumen del Socio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Titular</p>
                <p className="mt-1">{socio?.titular?.nombre_completo || 'No disponible'}</p>
              </div>
              
              {socio.tipo_cuota && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Tipo de Cuota</p>
                  <p className="mt-1">
                    {socio.tipo_cuota.nombre} - {socio.tipo_cuota.monto ? `$${socio.tipo_cuota.monto}` : ''}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-gray-500">Cuota Social</p>
                <p className="mt-1">${socio.cuota_social}</p>
              </div>

              {socio.disciplinas && socio.disciplinas.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Disciplinas</p>
                  <div className="mt-1 space-y-1">
                    {socio.disciplinas.map((disciplina) => (
                      <div key={disciplina.id} className="flex justify-between">
                        <span>{disciplina.nombre}</span>
                        <span>${disciplina.monto}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 border-t">
                <div className="flex justify-between font-medium">
                  <span>Total General</span>
                  <span>${socio.total_general}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resumen de pagos */}
          {resumenPagos && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Resumen de Pagos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Total Pagado</span>
                  <span>${resumenPagos.total_pagado}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Total Pendiente</span>
                  <span>${resumenPagos.total_pendiente}</span>
                </div>
                {resumenPagos.ultimo_pago && (
                  <div className="pt-2 border-t">
                    <p className="text-sm font-medium text-gray-500">Último Pago</p>
                    <div className="mt-1">
                      <p>${resumenPagos.ultimo_pago.monto} - {new Date(resumenPagos.ultimo_pago.fecha).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-500">Mes: {resumenPagos.ultimo_pago.mes_cuota}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Formulario de pago */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Registrar Pago</CardTitle>
              <CardDescription>
                Completa los detalles del pago para {socio?.titular?.nombre_completo || 'el socio'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="monto">Monto</Label>
                    <Input
                      id="monto"
                      name="monto"
                      type="number"
                      step="0.01"
                      value={formData.monto}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fecha_pago">Fecha de Pago</Label>
                    <Input
                      id="fecha_pago"
                      name="fecha_pago"
                      type="date"
                      value={formData.fecha_pago}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tipo_pago">Método de Pago</Label>
                    <Select
                      value={formData.tipo_pago}
                      onValueChange={(value) => handleSelectChange('tipo_pago', value as TipoPago)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un método de pago" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="efectivo">Efectivo</SelectItem>
                        <SelectItem value="transferencia">Transferencia</SelectItem>
                        <SelectItem value="tarjeta">Tarjeta</SelectItem>
                        <SelectItem value="otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="referencia">Referencia (opcional)</Label>
                    <Input
                      id="referencia"
                      name="referencia"
                      type="text"
                      value={formData.referencia}
                      onChange={handleChange}
                      placeholder="Número de transacción o referencia"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mes_anio_cuota">Mes de la Cuota</Label>
                    <Input
                      id="mes_anio_cuota"
                      name="mes_anio_cuota"
                      type="month"
                      value={formData.mes_anio_cuota.slice(0, 7)}
                      onChange={(e) => {
                        const value = e.target.value ? `${e.target.value}-01` : ''
                        setFormData(prev => ({ ...prev, mes_anio_cuota: value }))
                      }}
                      required
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="notas">Notas (opcional)</Label>
                    <textarea
                      id="notas"
                      name="notas"
                      rows={3}
                      value={formData.notas}
                      onChange={handleChange}
                      className="flex h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Agrega cualquier nota adicional sobre el pago"
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <AlertTriangle className="h-5 w-5 text-red-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={saving}
                    className="border-[#1e3a8a] text-[#1e3a8a] hover:bg-[#1e3a8a]/10 hover:text-[#1e3a8a]"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={saving}
                    className="bg-[#efb600] hover:bg-[#d4a300] text-black"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Guardar Pago
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Historial de pagos */}
          {pagos.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Historial de Pagos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Monto
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Método
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Referencia
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {pagos.map((pago) => (
                        <tr key={pago.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(pago.fecha_pago).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            ${pago.monto}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                            {pago.tipo_pago}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {pago.referencia || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}