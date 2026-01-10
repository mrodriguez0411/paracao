import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

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

    // Obtener las disciplinas del admin
    const { data: disciplinas, error: dError } = await supabase.from('disciplinas').select('id').eq('admin_id', profile.id)
    if (dError) {
      console.error('[mi-disciplina/inscripciones] Error al obtener disciplinas:', dError)
      return NextResponse.json({ error: dError.message }, { status: 500 })
    }

    const disciplinaIds = (disciplinas || []).map((d: any) => d.id)

    if (disciplinaIds.length === 0) {
      return NextResponse.json([], { status: 200 })
    }

    // Obtener inscripciones para esas disciplinas, con datos del miembro
    const { data, error } = await supabase
      .from('inscripciones')
      .select('id, activa, fecha_inscripcion, disciplina_id, miembro_id, miembros_familia(id, nombre_completo, dni, grupo_id)')
      .in('disciplina_id', disciplinaIds)

    if (error) {
      console.error('[mi-disciplina/inscripciones] Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [], { status: 200 })
  } catch (error) {
    console.error('[mi-disciplina/inscripciones] Error inesperado:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error desconocido' }, { status: 500 })
  }
}
