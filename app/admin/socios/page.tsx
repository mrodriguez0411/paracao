'use client'

import { useEffect, useState, useCallback } from 'react'
import { requireAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus } from "lucide-react"
import Link from "next/link"
import { SociosTable, type GrupoWithData } from "@/components/admin/socios-table"

export default function SociosPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [grupos, setGrupos] = useState<GrupoWithData[]>([])
  const [loading, setLoading] = useState(true)

  const loadSocios = useCallback(async (search = '') => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/socios', { cache: 'no-store' })
      if (!res.ok) throw new Error(`Error ${res.status}`)
      
      const gruposApi: GrupoWithData[] = await res.json()

      let datos = gruposApi.map((g) => ({
        ...g,
        totalMiembros: 1 + (Array.isArray(g.miembros_familia) ? g.miembros_familia.length : 0),
      }))

      if (search) {
        const searchLower = search.toLowerCase()
        datos = datos.filter((grupo) => {
          const nombreTitular = grupo.profiles?.nombre_completo?.toLowerCase() || ''
          const emailTitular = grupo.profiles?.email?.toLowerCase() || ''
          const dniTitular = grupo.profiles?.dni?.toLowerCase() || ''
          const nombreGrupo = grupo.nombre?.toLowerCase() || ''

          return (
            nombreTitular.includes(searchLower) ||
            emailTitular.includes(searchLower) ||
            dniTitular.includes(searchLower) ||
            nombreGrupo.includes(searchLower)
          )
        })
      }

      setGrupos(datos)
    } catch (error) {
      console.error('Error al cargar los datos de socios:', error)
      alert('Ocurrió un error al cargar los datos de socios. Por favor, intente nuevamente.')
    } finally {
      setLoading(false)
    }
  }, []);

  useEffect(() => {
    loadSocios();
    // Configurar listeners para recargar al volver a la pestaña
    const handleFocus = () => loadSocios(searchTerm);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            handleFocus();
        }
    });

    return () => {
        window.removeEventListener('focus', handleFocus);
        document.removeEventListener('visibilitychange', handleFocus);
    };
}, [loadSocios, searchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadSocios(searchTerm);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight" style={{ color: "#efb600" }}>Socios</h2>
          <p className="text-muted-foreground" style={{ color: "#efb600" }}>Gestiona los grupos familiares y sus miembros</p>
        </div>
        <Button asChild style={{ backgroundColor: "#efb600", color: "#1e3a8a" }}>
          <Link href="/admin/socios/nuevo">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Socio
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por nombre o DNI..."
              className="w-full pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={loading} style={{ backgroundColor: "#efb600", color: "#1e3a8a" }}>
            <Search className="mr-2 h-4 w-4" />
            Buscar
          </Button>
        </form>
      </div>

      <SociosTable grupos={grupos} loading={loading} />
    </div>
  )
}
