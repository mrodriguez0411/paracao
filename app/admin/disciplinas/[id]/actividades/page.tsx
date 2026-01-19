import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import ActividadesView from './actividades-view'
import type { Actividad } from './types'

export const dynamic = 'force-dynamic'

// Este es el Componente de Servidor. Su única responsabilidad es
// obtener datos y pasarlos al componente de cliente.
export default async function ActividadesPage({ params }: { params: { id: string } }) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  // 1. Obtener la disciplina
  const { data: disciplina, error: disciplinaError } = await supabase
    .from('disciplinas')
    .select('id, nombre')
    .eq('id', params.id)
    .single()

  if (disciplinaError || !disciplina) {
    notFound()
  }

  // 2. Obtener las actividades de esa disciplina
  const { data: actividades, error: actividadesError } = await supabase
    .from('actividades')
    .select('*')
    .eq('disciplina_id', params.id)
    .order('nombre', { ascending: true })
    
  if (actividadesError) {
    console.error('Error fetching actividades:', actividadesError)
    return <div>Error al cargar las actividades.</div>
  }

  // 3. Renderizar el componente de cliente pasándole los datos iniciales
  return (
    <ActividadesView 
      initialActividades={actividades as Actividad[]}
      disciplinaId={disciplina.id}
      disciplinaNombre={disciplina.nombre}
    />
  )
}
