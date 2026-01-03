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

    const { data, error } = await supabase
      .from('admin_disciplinas')
      .select('admin_id, disciplina_id, nombre')
      .eq('admin_id', profile.id)

    if (error) {
      console.error('[mi-disciplina/assignments] Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [], { status: 200 })
  } catch (error) {
    console.error('[mi-disciplina/assignments] Error inesperado:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error desconocido' }, { status: 500 })
  }
}
