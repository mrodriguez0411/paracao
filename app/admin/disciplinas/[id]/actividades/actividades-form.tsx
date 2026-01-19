'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

export default function ActividadesForm({ disciplinaId }: { disciplinaId: string }) {
  const [nombre, setNombre] = useState('')
  const [precio, setPrecio] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClientComponentClient()
  const router = useRouter()

  const handleGuardar = async () => {
    if (!nombre || !precio) {
      setError('Nombre y precio son requeridos')
      return
    }
    setLoading(true)
    setError(null)

    const { error: insertError } = await supabase
      .from('actividades')
      .insert({ nombre, precio: Number(precio), disciplina_id: disciplinaId })

    if (insertError) {
      setError(insertError.message)
    } else {
      setNombre('')
      setPrecio('')
      router.refresh() // Recargar la página para mostrar la nueva actividad
    }
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-red-500">{error}</p>}
      <input
        type="text"
        placeholder="Nombre de la actividad"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        className="w-full p-2 border rounded"
      />
      <input
        type="number"
        placeholder="Precio"
        value={precio}
        onChange={(e) => setPrecio(e.target.value)}
        className="w-full p-2 border rounded"
      />
      <button
        onClick={handleGuardar}
        disabled={loading}
        className="w-full p-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
      >
        {loading ? 'Guardando...' : 'Guardar Actividad'}
      </button>
    </div>
  )
}
