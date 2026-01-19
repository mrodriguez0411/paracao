"use server"

import { revalidatePath } from "next/cache"
import { createServiceRoleClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/auth"

// --- Tipos de Datos ---
export type CuotaDetalle = {
  id: string
  mes: number
  anio: number
  monto: number
  pagada: boolean
  fecha_vencimiento: string
  tipo: "social" | "deportiva"
  detalle: string // e.g., "Cuota Social" or "Fútbol: Entrenamiento Adultos"
  actividad_id: string | null
}

export type GrupoConCuotas = {
  grupo_id: string
  grupo_nombre: string
  cuotas: CuotaDetalle[]
}

interface ActionResult {
  success: boolean
  data?: GrupoConCuotas[]
  message: string
}

// --- Acción para OBTENER las cuotas (con soporte para "todos los meses") ---
export async function getCuotas(mes: number | null, anio: number): Promise<ActionResult> {
  await requireAuth(["super_admin"])

  // Validación de entrada
  if (mes !== null && (mes < 1 || mes > 12)) {
    return { success: false, message: "Mes inválido." }
  }
  if (!anio || anio < 2020) {
    return { success: false, message: "Año inválido." }
  }

  const supabase = createServiceRoleClient()

  try {
    // 1. Construcción de la consulta de cuotas
    let cuotasQuery = supabase.from("cuotas").select("*").eq("anio", anio)
    if (mes !== null) {
      cuotasQuery = cuotasQuery.eq("mes", mes)
    }

    // 2. Obtener todos los datos necesarios en paralelo
    const [cuotasRes, gruposRes, actividadesRes, disciplinasRes] = await Promise.all([
      cuotasQuery,
      supabase.from("grupos_familiares").select("id, nombre"),
      supabase.from("actividades").select("id, nombre, disciplina_id"),
      supabase.from("disciplinas").select("id, nombre"),
    ])

    // 3. Manejo de errores
    if (cuotasRes.error) throw new Error(`Al buscar cuotas: ${cuotasRes.error.message}`)
    if (gruposRes.error) throw new Error(`Al buscar grupos: ${gruposRes.error.message}`)
    if (actividadesRes.error) throw new Error(`Al buscar actividades: ${actividadesRes.error.message}`)
    if (disciplinasRes.error) throw new Error(`Al buscar disciplinas: ${disciplinasRes.error.message}`)

    // 4. Crear mapas para búsquedas eficientes
    const disciplinaMap = new Map(disciplinasRes.data.map(d => [d.id, d.nombre]))
    const actividadMap = new Map(actividadesRes.data.map(a => [a.id, { nombre: a.nombre, disciplina_id: a.disciplina_id }]))

    // 5. Inicializar mapa para agrupar cuotas por grupo familiar
    const gruposConCuotasMap = new Map<string, GrupoConCuotas>()
    for (const grupo of gruposRes.data) {
      gruposConCuotasMap.set(grupo.id, {
        grupo_id: grupo.id,
        grupo_nombre: grupo.nombre,
        cuotas: [],
      })
    }

    // 6. Procesar cada cuota para enriquecerla con detalles
    for (const cuota of cuotasRes.data) {
      const grupo = gruposConCuotasMap.get(cuota.grupo_id)

      if (grupo) {
        let detalle = "Detalle no disponible"
        if (cuota.tipo === "social") {
          detalle = "Cuota Social"
        } else if (cuota.actividad_id) {
          const actividad = actividadMap.get(cuota.actividad_id)
          if (actividad) {
            const disciplinaNombre = disciplinaMap.get(actividad.disciplina_id) || "Disciplina Desconocida"
            detalle = `${disciplinaNombre}: ${actividad.nombre}`
          } else {
            detalle = "Actividad Desconocida"
          }
        }

        const detalleCuota: CuotaDetalle = {
          id: cuota.id,
          mes: cuota.mes,
          anio: cuota.anio,
          monto: cuota.monto,
          pagada: cuota.pagada,
          fecha_vencimiento: cuota.fecha_vencimiento,
          tipo: cuota.tipo,
          actividad_id: cuota.actividad_id,
          detalle: detalle,
        }
        grupo.cuotas.push(detalleCuota)
      }
    }

    // 7. Transformación final y ordenamiento de los datos
    const resultData = Array.from(gruposConCuotasMap.values()).filter(g => g.cuotas.length > 0)
    resultData.sort((a, b) => a.grupo_nombre.localeCompare(b.grupo_nombre))

    return { success: true, data: resultData, message: "Datos obtenidos." }
  } catch (error: any) {
    console.error("Error en la acción getCuotas:", error)
    return { success: false, message: `Error en la base de datos: ${error.message}` }
  }
}

// --- Acción para REGISTRAR un PAGO (sin cambios) ---
export async function registrarPagoManual(cuotaId: string) {
  await requireAuth(["super_admin"])

  if (!cuotaId) {
    return { success: false, message: "ID de cuota no proporcionado." }
  }

  const supabase = createServiceRoleClient()

  const { data, error } = await supabase
    .from("cuotas")
    .update({
      pagada: true,
      fecha_pago: new Date().toISOString(),
    })
    .eq("id", cuotaId)
    .select()
    .single()

  if (error) {
    console.error("Error al registrar el pago:", error)
    return { success: false, message: `Error en la base de datos: ${error.message}` }
  }

  revalidatePath("/admin/historial-cuotas")

  return { success: true, message: `Pago registrado para la cuota ${data.id}.` }
}
