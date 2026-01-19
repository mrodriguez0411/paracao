import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import ActividadesForm from "./actividades-form";

export const dynamic = 'force-dynamic'

async function getDiscipline(id: string, supabase: any) {
  const { data: disciplina } = await supabase
    .from("disciplinas")
    .select("*")
    .eq("id", id)
    .single();
  return disciplina;
}

async function getActivities(id: string, supabase: any) {
    const { data: actividades } = await supabase
        .from('actividades')
        .select('*')
        .eq('disciplina_id', id)
    return actividades
}

async function getUserRole(supabase: any) {
  const { data, error } = await supabase.rpc('get_user_role');
  if (error) {
    console.error('Error fetching user role:', error);
    return null;
  }
  return data;
}


export default async function ActividadesPage({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies });
  const [disciplina, actividades, userRole] = await Promise.all([
    getDiscipline(params.id, supabase),
    getActivities(params.id, supabase),
    getUserRole(supabase)
  ]);

  if (!disciplina) {
    notFound();
  }

  const isSuperAdmin = typeof userRole === 'string' && userRole.trim() === 'super_admin';

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4" style={{color: "#efb600"}}>
        Actividades de {disciplina.nombre}
      </h1>

      {/* --- DEBUGGING INFO --- */}
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
        <strong className="font-bold">Info de depuración:</strong>
        <span className="block sm:inline ml-2">Rol detectado: {JSON.stringify(userRole)}</span>
        <span className="block sm:inline ml-2">Resultado de isSuperAdmin: {isSuperAdmin.toString()}</span>
      </div>
      {/* --- END DEBUGGING INFO --- */}

      <div className={`grid grid-cols-1 ${isSuperAdmin ? 'md:grid-cols-2' : ''} gap-6`}>
        {isSuperAdmin && (
          <div>
            <h2 className="text-xl font-bold mb-4" style={{color: "#efb600"}}>Crear Nueva Actividad</h2>
            <ActividadesForm disciplinaId={params.id} />
          </div>
        )}
        <div className={!isSuperAdmin ? 'col-span-1' : ''}>
          <h2 className="text-xl font-bold mb-4" style={{color: "#efb600"}}>Actividades Existentes</h2>
          <div className="space-y-4">
            {actividades?.map((actividad) => (
              <div key={actividad.id} className="p-4 border rounded-lg">
                <h3 className="font-bold">{actividad.nombre}</h3>
                <p>Precio: ${actividad.precio}</p>
              </div>
            )) || <p>No hay actividades para esta disciplina.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
