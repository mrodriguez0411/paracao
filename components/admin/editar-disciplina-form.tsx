'use client'

import type React from 'react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import type { Tables } from "@/lib/types/supabase";

interface Admin {
  id: string
  nombre_completo: string
  email: string
}

// Combine the database type with the potentially added admin_id
type DisciplinaForForm = Tables<"disciplinas"> & { admin_id: string | null };

interface EditarDisciplinaFormProps {
  disciplina: DisciplinaForForm
  admins: Admin[]
}

export function EditarDisciplinaForm({ disciplina, admins }: EditarDisciplinaFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    nombre: disciplina.nombre,
    descripcion: disciplina.descripcion || '',
    cuota_deportiva: disciplina.cuota_deportiva.toString(),
    admin_id: disciplina.admin_id || '',
  })

  // Sync state if initial prop changes
  useEffect(() => {
    setFormData(prev => ({
        ...prev,
        admin_id: disciplina.admin_id || ''
    }));
  }, [disciplina.admin_id]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`/api/admin/disciplinas/${disciplina.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nombre: formData.nombre,
            descripcion: formData.descripcion || null,
            cuota_deportiva: Number.parseFloat(formData.cuota_deportiva),
            admin_id: formData.admin_id || null,
          }),
        },
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al actualizar la disciplina')
      }

      toast({
        title: 'Disciplina actualizada exitosamente',
      })

      router.push('/admin/disciplinas')
      router.refresh()
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Error al actualizar la disciplina',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Editar Disciplina</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre *</Label>
            <Input
              id="nombre"
              required
              placeholder="Ej: Fútbol, Natación, Tenis"
              value={formData.nombre}
              onChange={e => setFormData({ ...formData, nombre: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              placeholder="Descripción de la disciplina"
              value={formData.descripcion}
              onChange={e =>
                setFormData({ ...formData, descripcion: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cuota_deportiva">Cuota Deportiva Mensual *</Label>
            <Input
              id="cuota_deportiva"
              type="number"
              step="0.01"
              required
              placeholder="0.00"
              value={formData.cuota_deportiva}
              onChange={e =>
                setFormData({ ...formData, cuota_deportiva: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin_id">Administrador de Disciplina</Label>
            {admins.length > 0 ? (
              <Select
                value={formData.admin_id ?? ''} 
                onValueChange={value =>
                  setFormData({ ...formData, admin_id: value === 'ninguno' ? '' : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar administrador (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ninguno">Ninguno</SelectItem>
                  {admins.map(admin => (
                    <SelectItem key={admin.id} value={admin.id}>
                      {admin.nombre_completo} ({admin.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <>
                <Input disabled placeholder="No hay administradores de disciplina disponibles" />
                <p className="text-xs text-muted-foreground">
                  Para poder asignar un administrador, primero debe crear un usuario con el rol de &quot;admin_disciplina&quot;.
                </p>
              </>
            )}
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading} className="bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white">
              {isLoading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
               className="border-[#efb600] text-[#efb600] hover:bg-[#efb600]/10"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
