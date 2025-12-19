'use server'

import { createServiceRoleClient } from '@/lib/supabase/server'
import { unstable_noStore as noStore } from 'next/cache'

// Tipos para asegurar la consistencia de los datos
interface Cuota {
  id: string
  mes: number
  anio: number
  monto: number
  pagada: boolean
  fecha_vencimiento: string
  tipo: 'social' | 'deportiva'
  disciplina_nombre?: string // Nombre de la disciplina para cuotas deportivas
  miembro_nombre?: string // Nombre del miembro para cuotas deportivas
}

interface HistorialCuotas {
  cuotasSociales: Cuota[]
  cuotasDeportivas: Cuota[]
}

// Mapa para convertir el número del mes a nombre
const meses: { [key: number]: string } = {
  1: 'Enero',
  2: 'Febrero',
  3: 'Marzo',
  4: 'Abril',
  5: 'Mayo',
  6: 'Junio',
  7: 'Julio',
  8: 'Agosto',
  9: 'Septiembre',
  10: 'Octubre',
  11: 'Noviembre',
  12: 'Diciembre'
}

// Función principal para obtener el historial de cuotas de un grupo familiar
export async function getHistorialCuotas(grupoFamiliarId: string): Promise<HistorialCuotas> {
  noStore()
  const supabase = createServiceRoleClient()

  // 1. Obtener todas las cuotas (sociales y deportivas) del grupo familiar
  const { data: cuotas, error } = await supabase
    .from('cuotas')
    .select(`
      id,
      mes,
      anio,
      monto,
      pagada,
      fecha_vencimiento,
      tipo,
      disciplinas ( nombre ),
      miembros_familia ( nombre_completo )
    `)
    .eq('grupo_id', grupoFamiliarId)
    .order('anio', { ascending: false })
    .order('mes', { ascending: false })

  if (error) {
    console.error('Error fetching cuotas:', error)
    throw new Error('No se pudo cargar el historial de cuotas.')
  }

  // 2. Separar las cuotas en sociales y deportivas
  const cuotasSociales: Cuota[] = []
  const cuotasDeportivas: Cuota[] = []

  cuotas.forEach(cuota => {
    const cuotaTransformada: Cuota = {
      ...cuota,
      // @ts-ignore
      disciplina_nombre: cuota.disciplinas?.nombre,
      // @ts-ignore
      miembro_nombre: cuota.miembros_familia?.nombre_completo
    }
    if (cuota.tipo === 'social') {
      cuotasSociales.push(cuotaTransformada)
    } else {
      cuotasDeportivas.push(cuotaTransformada)
    }
  })

  return {
    cuotasSociales,
    cuotasDeportivas
  }
}

// Función para obtener el nombre del grupo familiar
export async function getGrupoFamiliarNombre(grupoFamiliarId: string): Promise<string> {
  noStore()
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from('grupos_familiares')
    .select('nombre')
    .eq('id', grupoFamiliarId)
    .single()

  if (error || !data) {
    console.error('Error fetching group name:', error)
    return 'Grupo Familiar'
  }

  return data.nombre
}
