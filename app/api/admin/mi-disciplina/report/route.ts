import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const profile = await getCurrentUser()

    if (!profile) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (profile.rol !== 'admin_disciplina' && profile.rol !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const supabase = await createClient()

    const [
      disciplinasRes,
      assignmentsRes,
      inscripcionesRes,
      miembrosRpcRes
    ] = await Promise.all([
      supabase.from('disciplinas').select('id, nombre, admin_id').eq('admin_id', profile.id),
      supabase.from('admin_disciplinas').select('admin_id, disciplina_id, nombre').eq('admin_id', profile.id),
      (async () => {
        const { data: disciplinas } = await supabase.from('disciplinas').select('id').eq('admin_id', profile.id)
        const ids = (disciplinas || []).map((d: any) => d.id)
        if (ids.length === 0) return { data: [] }
        return supabase.from('inscripciones').select('id, activa, fecha_inscripcion, disciplina_id, miembro_id, miembros_familia(id, nombre_completo, dni, grupo_id)').in('disciplina_id', ids)
      })(),
      supabase.rpc('get_miembros_de_mi_disciplina')
    ])

    const response = {
      profile: { id: profile.id, rol: profile.rol, nombre_completo: profile.nombre_completo },
      disciplinas: disciplinasRes.data || [],
      assignments: assignmentsRes.data || [],
      inscripciones: inscripcionesRes.data || [],
      miembros_rpc: miembrosRpcRes.data || []
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('[mi-disciplina/report] Error inesperado:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error desconocido' }, { status: 500 })
  }
}