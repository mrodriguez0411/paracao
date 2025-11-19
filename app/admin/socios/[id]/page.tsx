"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Loader2, ArrowLeft, Edit } from "lucide-react"
import Link from "next/link"

interface SocioData {
  id: string
  nombre: string
  cuota_social: number
  created_at: string
  profiles: {
    nombre_completo: string
    email: string
    dni: string
    telefono: string | null
  }
  miembros_familia: Array<{
    id: string
    nombre_completo: string
    dni: string | null
    parentesco: string | null
  }>
}

export default function VerSocioPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const grupoId = params.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [socioData, setSocioData] = useState<SocioData | null>(null)

  useEffect(() => {
    fetchSocioData()
  }, [grupoId])

  async function fetchSocioData() {
    try {
      const response = await fetch(`/api/admin/socios/${grupoId}`)
      if (!response.ok) {
        throw new Error("Error al cargar los datos del socio")
      }

      // También obtener los miembros familiares
      const socioResponse = await fetch(`/api/admin/socios/${grupoId}`)
      const socio = await socioResponse.json()

      // Obtener miembros
      const miembrosResponse = await fetch(`/api/admin/socios/${grupoId}/miembros`)
      const miembros = miembrosResponse.ok ? await miembrosResponse.json() : []

      setSocioData({ ...socio, miembros_familia: miembros })
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!socioData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Socio no encontrado</p>
          <Button className="mt-4" onClick={() => router.push("/admin/socios")}>
            Volver
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" className="text-[#1e3a8a] hover:bg-[#1e3a8a]/10" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-[#1e3a8a]">Datos del Socio</CardTitle>
          <Button asChild variant="outline" size="sm" className="border-[#1e3a8a] text-[#1e3a8a] hover:bg-[#1e3a8a]/5">
            <Link href={`/admin/socios/${grupoId}/editar`}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Grupo Familiar */}
          <div className="border-b pb-4">
            <h3 className="font-semibold text-lg text-[#1e3a8a] mb-4">Grupo Familiar</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-gray-600">Nombre del Grupo</p>
                <p className="font-medium">{socioData.nombre}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Cuota Social Mensual</p>
                <p className="font-medium">${socioData.cuota_social}</p>
              </div>
            </div>
          </div>

          {/* Datos del Titular */}
          <div className="border-b pb-4">
            <h3 className="font-semibold text-lg text-[#1e3a8a] mb-4">Datos del Titular</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-gray-600">Nombre Completo</p>
                <p className="font-medium">{socioData.profiles?.nombre_completo}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">DNI</p>
                <p className="font-medium font-mono">{socioData.profiles?.dni}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{socioData.profiles?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Teléfono</p>
                <p className="font-medium">{socioData.profiles?.telefono || "No especificado"}</p>
              </div>
            </div>
          </div>

          {/* Miembros Familiares */}
          <div>
            <h3 className="font-semibold text-lg text-[#1e3a8a] mb-4">Miembros Familiares</h3>
            {socioData.miembros_familia && socioData.miembros_familia.length > 0 ? (
              <div className="space-y-3">
                {socioData.miembros_familia.map((miembro) => (
                  <div
                    key={miembro.id}
                    className="border rounded-lg p-4 bg-slate-50"
                  >
                    <div className="grid gap-3 md:grid-cols-3">
                      <div>
                        <p className="text-sm text-gray-600">Nombre</p>
                        <p className="font-medium">{miembro.nombre_completo}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">DNI</p>
                        <p className="font-mono font-semibold">{miembro.dni || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Parentesco</p>
                        <p className="font-medium">{miembro.parentesco || "No especificado"}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No hay miembros familiares agregados</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
