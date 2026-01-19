'use client'

import Link from 'next/link'
import { useState, useTransition, useRef } from 'react'
import { createActividad, updateActividad, deleteActividad } from './actions'
import type { Actividad } from './types'

// --- Componente Interno: Formulario de Actividad ---
const ActividadesForm = ({ disciplinaId }: { disciplinaId: string }) => {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = (formData: FormData) => {
    setError(null)
    startTransition(async () => {
      const result = await createActividad(formData)
      if (result.success) {
        formRef.current?.reset()
      } else {
        setError(result.message)
      }
    })
  }

  return (
    <div>
      <form ref={formRef} action={handleSubmit} className="space-y-4">
        {error && <p className="text-red-500">{error}</p>}
        <input type="hidden" name="disciplinaId" value={disciplinaId} />
        <input
          type="text"
          name="nombre"
          placeholder="Nombre de la actividad"
          required
          className="w-full p-2 border rounded"
          style={{ color: '#efb600' }}
        />
        <input
          type="number"
          name="precio"
          placeholder="Precio"
          required
          className="w-full p-2 border rounded"
          style={{ color: '#ffffff' }}
        />
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-[#efb600] text-[#1e3a8a] font-bold py-2 px-4 rounded disabled:bg-gray-400"
        >
          {isPending ? 'Guardando...' : 'Guardar Actividad'}
        </button>
      </form>
    </div>
  )
}

// --- Componente Interno: Item de Actividad ---
const ActividadItem = ({ actividad }: { actividad: Actividad }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleUpdate = async (formData: FormData) => {
    setError(null)
    startTransition(async () => {
      const result = await updateActividad(formData)
      if (!result.success) {
        setError(result.message)
      } else {
        setIsEditing(false)
      }
    })
  }

  const handleDelete = async () => {
    if (!window.confirm(`¿Está seguro de que desea eliminar la actividad \"${actividad.nombre}\"?`)) {
      return
    }
    setError(null)
    startTransition(async () => {
      const formData = new FormData()
      formData.append('id', actividad.id)
      formData.append('disciplinaId', actividad.disciplina_id)
      const result = await deleteActividad(formData)
      if (!result.success) {
        setError(result.message)
      }
    })
  }

  return (
    <div className="p-4 border rounded-lg">
      {error && <p className="text-red-500 mb-4">Error: {error}</p>}
      {isEditing ? (
        <form action={handleUpdate} className="space-y-2">
          <input type="hidden" name="id" value={actividad.id} />
          <input type="hidden" name="disciplinaId" value={actividad.disciplina_id} />
          <input
            type="text"
            name="nombre"
            defaultValue={actividad.nombre}
            className="w-full p-2 border rounded"
            style={{ color: '#efb600' }}
            required
          />
          <input
            type="number"
            name="precio"
            defaultValue={actividad.precio}
            className="w-full p-2 border rounded"
            style={{ color: '#ffffff' }}
            required
          />
          <div className="flex space-x-2">
            <button type="submit" disabled={isPending} className="bg-[#efb600] text-[#1e3a8a] font-bold py-2 px-4 rounded disabled:bg-gray-400">
              {isPending ? 'Guardando...' : 'Guardar'}
            </button>
            <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 bg-gray-500 text-white rounded">
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold" style={{ color: '#efb600' }}>{actividad.nombre}</h3>
            <p style={{ color: '#ffffff' }}>Precio: ${actividad.precio}</p>
          </div>
          <div className="flex space-x-2">
            <button onClick={() => setIsEditing(true)} className="bg-[#efb600] text-[#1e3a8a] font-bold py-2 px-4 rounded">
              Editar
            </button>
            <button onClick={handleDelete} disabled={isPending} className="px-4 py-2 bg-red-500 text-white rounded disabled:bg-gray-400">
              {isPending ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// --- Componente Principal Exportado ---
interface ActividadesViewProps {
  initialActividades: Actividad[];
  disciplinaId: string;
  disciplinaNombre: string;
}

export default function ActividadesView({ initialActividades, disciplinaId, disciplinaNombre }: ActividadesViewProps) {
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold" style={{ color: '#efb600' }}>Actividades de {disciplinaNombre}</h1>
        <Link href="/admin/disciplinas" className="bg-[#efb600] text-[#1e3a8a] font-bold py-2 px-4 rounded">
          Volver
        </Link>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2" style={{ color: '#efb600' }}>Nueva Actividad</h2>
        <ActividadesForm disciplinaId={disciplinaId} />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2" style={{ color: '#efb600' }}>Actividades Existentes</h2>
        {initialActividades && initialActividades.length > 0 ? (
          <div className="space-y-4">
            {initialActividades.map((actividad) => (
              <ActividadItem key={actividad.id} actividad={actividad} />
            ))}
          </div>
        ) : (
          <p style={{ color: '#efb600' }}>No hay actividades para esta disciplina.</p>
        )}
      </div>
    </div>
  )
}
