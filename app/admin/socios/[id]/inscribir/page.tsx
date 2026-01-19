'use client'

import { InscripcionForm } from "@/components/admin/inscripcion-form"

export default function page({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Inscribir a Disciplina</h1>
      <InscripcionForm miembroId={params.id} />
    </div>
  )
}
