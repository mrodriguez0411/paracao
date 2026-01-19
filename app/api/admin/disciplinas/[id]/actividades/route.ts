import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { data, error } = await supabase
    .from('actividades')
    .select('*')
    .eq('disciplina_id', params.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
