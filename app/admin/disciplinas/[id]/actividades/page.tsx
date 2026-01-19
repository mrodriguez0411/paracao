import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies, headers } from "next/headers";
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

export default async function ActividadesPage({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies });
  const headersList = headers();
  const userRole = headersList.get('x-user-role');

  const [disciplina, actividades] = await Promise.all([
    getDiscipline(params.id, supabase),
    getActivities(params.id, supabase),
  ]);

 /* console.log('--- Debugging ActividadesPage ---');
  console.log('Discipline ID:', params.id);
  console.log('Fetched Disciplina:', disciplina);
  console.log('Fetched Actividades:', actividades);
  console.log('Fetched User Role:', userRole);
  console.log('-------------------------------');*/

  if (!disciplina) {
    notFound();
  }

  const isSuperAdmin = typeof userRole === 'string' && userRole.trim() === 'super_admin';

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4" style={{color: "#efb600"}}>
        Actividades de {disciplina.nombre}
      </h1>

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
