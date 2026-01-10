import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { activo } = await request.json()

    if (typeof activo !== 'boolean') {
      return NextResponse.json({ error: 'El campo "activo" es requerido y debe ser un booleano' }, { status: 400 })
    }

    const supabase = createServiceRoleClient()

    const { data, error } = await supabase
      .from('grupos_familiares')
      .update({ activo })
      .eq('id', id)
      .select('id, activo')
      .single()

    if (error) {
      console.error('[toggle-active] Error al actualizar estado del socio:', error)
      return NextResponse.json({ error: 'No se pudo actualizar el estado del socio' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('[toggle-active] Error inesperado:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    )
  }
}
