'use client'

import { useTransition, useRef, useState } from 'react'
import { createActividad } from './actions'

export default function ActividadesForm({ disciplinaId }: { disciplinaId: string }) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (formData: FormData) => {
    setError(null)

    startTransition(async () => {
      const result = await createActividad(formData)
      if (!result.success) {
        setError(result.message)
      } else {
        // Limpiar el formulario si la acción fue exitosa
        formRef.current?.reset()
      }
    })
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500">{error}</p>}
      
      <input type="hidden" name="disciplinaId" value={disciplinaId} />

      <input
        type="text"
        name="nombre"
        placeholder="Nombre de la actividad"
        required
        className="w-full p-2 border rounded"
      />
      <input
        type="number"
        name="precio"
        placeholder="Precio"
        required
        className="w-full p-2 border rounded"
      />
      <button
        type="submit"
        disabled={isPending}
        className="w-full p-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
      >
        {isPending ? 'Guardando...' : 'Guardar Actividad'}
      </button>
    </form>
  )
}
