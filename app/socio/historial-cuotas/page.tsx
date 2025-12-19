
import { requireAuth } from "@/lib/auth";
import { getHistorialCuotas, getGrupoFamiliarNombre } from './actions';
import { HistorialCuotasView } from '@/components/socio/historial-cuotas-view';
import { redirect } from "next/navigation";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mi Historial de Cuotas',
};

export default async function HistorialCuotasPage() {
  const profile = await requireAuth(['socio']);
  if (!profile || !profile.grupo_familiar_id) {
    redirect("/auth/login"); // Redirigir si no está autenticado o no tiene grupo
  }

  try {
    const [historial, nombreGrupo] = await Promise.all([
      getHistorialCuotas(profile.grupo_familiar_id),
      getGrupoFamiliarNombre(profile.grupo_familiar_id)
    ]);

    return (
      <div className="space-y-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Historial de Cuotas del <span className="text-[#1e3a8a]">{nombreGrupo}</span>
          </h1>
          <HistorialCuotasView 
              cuotasSociales={historial.cuotasSociales} 
              cuotasDeportivas={historial.cuotasDeportivas}
          />
      </div>
  );

  } catch (error) {
    console.error(error);
    return (
      <div className="flex flex-col items-center justify-center h-64">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error al Cargar el Historial</h2>
          <p className="text-gray-700 dark:text-gray-300">No se pudieron cargar los datos de las cuotas. Por favor, intenta de nuevo más tarde.</p>
      </div>
    )
  }
}
