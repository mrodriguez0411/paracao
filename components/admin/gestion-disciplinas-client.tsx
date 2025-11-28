'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateDisciplinaAdmin } from "@/app/admin/gestion-disciplinas/actions";
import type { Disciplina, Profile } from "@/lib/types"; // Usa la fuente única de verdad para los tipos

// Props que recibe el componente
interface GestionDisciplinasClientProps {
  // Aseguramos que las props usen los tipos correctos
  disciplinas: (Pick<Disciplina, 'id' | 'nombre' | 'admin_id'>)[];
  admins: (Pick<Profile, 'id' | 'nombre_completo'>)[];
}

export function GestionDisciplinasClient({ disciplinas, admins }: GestionDisciplinasClientProps) {
  const router = useRouter();
  const [assignments, setAssignments] = useState<Record<string, string | null>>(() => {
    const initialAssignments: Record<string, string | null> = {};
    disciplinas.forEach(d => {
      // Aseguramos que admin_id sea null si es undefined
      initialAssignments[d.id] = d.admin_id || null;
    });
    return initialAssignments;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Maneja el cambio en el menú desplegable
  const handleAdminChange = (disciplinaId: string, adminId: string) => {
    setAssignments(prev => ({ ...prev, [disciplinaId]: adminId === "null" ? null : adminId }));
  };

  // Maneja el envío del formulario para guardar los cambios
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    const updatePromises = Object.entries(assignments).map(([disciplinaId, adminId]) => {
        const originalAdminId = disciplinas.find(d => d.id === disciplinaId)?.admin_id;
        // Solo actualiza si el valor ha cambiado realmente
        if (adminId !== (originalAdminId || null)) {
            return updateDisciplinaAdmin(disciplinaId, adminId);
        }
        return Promise.resolve({ success: true });
    });

    try {
      const results = await Promise.all(updatePromises);
      const firstError = results.find(res => res && 'error' in res && res.error);

      if (firstError && 'error' in firstError) {
        throw new Error(firstError.error);
      }

      // Forzar la recarga de la página para ver los cambios
      router.refresh();
      alert("¡Asignaciones actualizadas con éxito!");

    } catch (err: any) {
      console.error("Error al actualizar las asignaciones:", err);
      setError(err.message || "Ocurrió un error desconocido.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-800">
          <tr>
            <th scope="col" className="py-3.5 px-4 text-left text-sm font-semibold text-white">Disciplina</th>
            <th scope="col" className="py-3.5 px-4 text-left text-sm font-semibold text-white">Administrador Asignado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800 bg-gray-900">
          {disciplinas.map((disciplina) => (
            <tr key={disciplina.id}>
              <td className="whitespace-nowrap py-4 px-4 text-sm font-medium text-white">{disciplina.nombre}</td>
              <td className="whitespace-nowrap py-4 px-4 text-sm font-medium text-black">
                <select
                  value={assignments[disciplina.id] || 'null'}
                  onChange={(e) => handleAdminChange(disciplina.id, e.target.value)}
                  className="block w-full rounded-md border-gray-600 bg-gray-700 py-2 pl-3 pr-10 text-base text-black focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="null">-- Sin Asignar --</option>
                  {admins.map((admin) => (
                    <option key={admin.id} value={admin.id}>
                      {admin.nombre_completo}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-6 flex items-center justify-end gap-x-6">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="rounded-md bg-yellow-500 px-4 py-2 text-sm font-semibold text-blue-900 shadow-sm hover:bg-yellow-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-500 disabled:opacity-50"
        >
          {isSubmitting ? "Guardando..." : "Guardar Cambios"}
        </button>
      </div>
      {error && <p className="mt-4 text-sm text-red-500">Error: {error}</p>}
    </div>
  );
}
