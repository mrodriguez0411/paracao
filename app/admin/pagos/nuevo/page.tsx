'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, ArrowLeft, Save, CreditCard, Users, User, Calendar, DollarSign, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

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
    monto: number
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
  const socioId = searchParams.get('socio_id')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [socio, setSocio] = useState<Socio | null>(null)
  const [resumenPagos, setResumenPagos] = useState<ResumenPagos | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pagos, setPagos] = useState<Pago[]>([])

  const [formData, setFormData] = useState({
    monto: '',
    fecha_pago: new Date().toISOString().split('T')[0],
    tipo_pago: 'efectivo' as TipoPago,
    referencia: '',
    mes_anio_cuota: new Date().toISOString().slice(0, 7) + '-01',
    notas: ''
  })

  // Cargar datos del socio y sus cuotas
useEffect(() => {
  const fetchData = async () => {
    if (!socioId) {
      setError('No se ha especificado un socio')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const [socioRes, pagosRes] = await Promise.all([
        fetch(`/api/admin/socios/${socioId}/cuotas`),
        fetch(`/api/admin/socios/${socioId}/pagos`)
      ])

      if (!socioRes.ok) throw new Error('Error al cargar los datos del socio')
      if (!pagosRes.ok) throw new Error('Error al cargar los pagos')

      const socioData = await socioRes.json()
      const pagosData = await pagosRes.json()

      setSocio(socioData.grupo)
      setResumenPagos(socioData.resumen)
      setPagos(pagosData)

      // Establecer el monto por defecto según el total general
      if (socioData.grupo?.total_general) {
        setFormData(prev => ({
          ...prev,
          monto: socioData.grupo.total_general.toString()
        }))
      }
    } catch (err) {
      console.error('Error al cargar los datos:', err)
      setError('Error al cargar la información del socio y sus pagos')
    } finally {
      setLoading(false)
    }
  }

  fetchData()
}, [socioId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!socioId) {
      setError('No se ha especificado un socio')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const payload = {
        ...formData,
        grupo_id: socioId,
        monto: parseFloat(formData.monto),
        mes_anio_cuota: formData.mes_anio_cuota
      }

      const res = await fetch('/api/admin/pagos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Error al guardar el pago')
      }

      // Redirigir al detalle del socio en la pestaña de pagos
      router.push(`/admin/socios/${socioId}?tab=pagos`)
    } catch (err) {
      console.error('Error al guardar el pago:', err)
      setError(err instanceof Error ? err.message : 'Error al guardar el pago')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-800" />
        <span className="ml-2">Cargando información del socio...</span>
      </div>
    )
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
          </div>
        </div>
        <div className="mt-4">
          <Link 
            href="/admin/socios" 
            className="text-blue-600 hover:underline text-sm font-medium"
          >
            &larr; Volver a la lista de socios
          </Link>
        </div>
      </div>
    )
  }

  if (!socio) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">Socio no encontrado</h3>
        <p className="mt-1 text-sm text-gray-500">
          No se pudo encontrar la información del socio solicitado.
        </p>
        <div className="mt-6">
          <Link
            href="/admin/socios"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Volver a la lista de socios
          </Link>
        </div>
      </div>
    )
  }

  // Formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  // Obtener el mes y año formateado
  const getMesAnio = (fecha: string) => {
    const [anio, mes] = fecha.split('-')
    const fechaObj = new Date(parseInt(anio), parseInt(mes) - 1, 1)
    return fechaObj.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
  }

  return (
    <div className="space-y-6">
      {/* Encabezado con información del socio */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Información del Socio
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Detalles del grupo familiar y cuotas
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <User className="h-4 w-4 mr-2 text-gray-400" />
                Titular
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {socio.titular.nombre_completo}
                <p className="text-sm text-gray-500">{socio.titular.dni}</p>
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <Users className="h-4 w-4 mr-2 text-gray-400" />
                Grupo Familiar
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {socio.nombre || 'Sin nombre de grupo'}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                Cuota Social
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <span>Mensualidad</span>
                  <span className="font-medium">${socio.cuota_social.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                </div>
                {socio.tipo_cuota && (
                  <Badge variant="outline" className="mt-1">
                    {socio.tipo_cuota.nombre}
                  </Badge>
                )}
              </dd>
            </div>
            {socio.disciplinas.length > 0 && (
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Cuotas Deportivas
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <div className="space-y-2">
                    {socio.disciplinas.map(disciplina => (
                      <div key={disciplina.id} className="flex items-center justify-between">
                        <span>{disciplina.nombre}</span>
                        <span className="font-medium">${disciplina.monto.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    ))}
                    <div className="border-t border-gray-200 pt-2 mt-2 flex items-center justify-between font-medium">
                      <span>Total Cuotas Deportivas:</span>
                      <span>${socio.total_cuota_deportiva.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </dd>
              </div>
            )}
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-gray-50">
              <dt className="text-sm font-medium text-gray-900">
                Total Mensual
              </dt>
              <dd className="mt-1 text-lg font-bold text-gray-900 sm:mt-0 sm:col-span-2">
                ${socio.total_general.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Resumen de pagos */}
      {resumenPagos && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Resumen de Pagos
            </h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            <dl className="sm:divide-y sm:divide-gray-200">
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Total Pagado
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  ${resumenPagos.total_pagado.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Saldo Pendiente
                </dt>
                <dd className={`mt-1 text-sm font-medium sm:mt-0 sm:col-span-2 ${
                  resumenPagos.total_pendiente > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  ${Math.abs(resumenPagos.total_pendiente).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  {resumenPagos.total_pendiente > 0 ? ' (Deuda)' : ' (A favor)'}
                </dd>
              </div>
              {resumenPagos.ultimo_pago && (
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Último Pago
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <div className="flex justify-between">
                      <span>
                        {formatDate(resumenPagos.ultimo_pago.fecha)} - {getMesAnio(resumenPagos.ultimo_pago.mes_cuota)}
                      </span>
                      <span className="font-medium">
                        ${resumenPagos.ultimo_pago.monto.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      )}

      {/* Formulario de pago */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg" style={{ color: '#1e3a8a' }}>Registrar Nuevo Pago</CardTitle>
          <CardDescription>
            Complete los datos del pago para el mes correspondiente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Mes de Cuota */}
              <div className="space-y-2">
                <Label htmlFor="mes_anio_cuota">Mes de la Cuota</Label>
                <Input
                  id="mes_anio_cuota"
                  name="mes_anio_cuota"
                  type="month"
                  value={formData.mes_anio_cuota.slice(0, 7)}
                  onChange={(e) => {
                    const value = e.target.value
                    setFormData(prev => ({
                      ...prev,
                      mes_anio_cuota: value ? `${value}-01` : ''
                    }))
                  }}
                  required
                />
              </div>

              {/* Monto */}
              <div className="space-y-2">
                <Label htmlFor="monto">Monto (ARS)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                  <Input
                    id="monto"
                    name="monto"
                    type="number"
                    step="0.01"
                    value={formData.monto}
                    onChange={handleChange}
                    className="pl-8"
                    required
                  />
                </div>
              </div>

              {/* Fecha de Pago */}
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

              {/* Tipo de Pago */}
              <div className="space-y-2">
                <Label htmlFor="tipo_pago">Método de Pago</Label>
                <Select
                  value={formData.tipo_pago}
                  onValueChange={(value) => handleSelectChange('tipo_pago', value as TipoPago)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un método" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="efectivo">Efectivo</SelectItem>
                    <SelectItem value="transferencia">Transferencia</SelectItem>
                    <SelectItem value="tarjeta">Tarjeta</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Referencia */}
              <div className="space-y-2">
                <Label htmlFor="referencia">Referencia / N° de Operación</Label>
                <Input
                  id="referencia"
                  name="referencia"
                  value={formData.referencia}
                  onChange={handleChange}
                  placeholder="Opcional"
                />
              </div>

              {/* Notas */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notas">Notas Adicionales</Label>
                <textarea
                  id="notas"
                  name="notas"
                  rows={3}
                  value={formData.notas}
                  onChange={handleChange}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Ingrese cualquier información adicional sobre el pago"
                />
              </div>
            </div>

            {/* Errores */}
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

            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={saving}
                style={{ backgroundColor: '#EFB600', color: '#1e3a8a' }}
                className="hover:bg-yellow-500"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Registrar Pago
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Historial de pagos */}
      {pagos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg" style={{ color: '#1e3a8a' }}>Historial de Pagos</CardTitle>
            <CardDescription>Últimos pagos registrados</CardDescription>
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
                      Mes Cuota
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Método
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monto
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Referencia
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pagos.map((pago) => (
                    <tr key={pago.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(pago.fecha_pago)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getMesAnio(pago.mes_anio_cuota)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                        {pago.tipo_pago}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                        ${pago.monto.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
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
  )
}