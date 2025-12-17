"use server"

import { createServiceRoleClient } from "@/lib/supabase/server"
import { z } from "zod"
import { revalidatePath } from "next/cache"

const GenerarCuotasSchema = z.object({
  mes: z.coerce.number().min(1).max(12),
  anio: z.coerce.number().min(new Date().getFullYear() - 5).max(new Date().getFullYear() + 5),
})

// Función de Ayuda para evitar duplicación en la creación de cuotas
async function createFeeIfNotExists(supabase: any, check: any, newFee: any) {
  const { data: existing } = await supabase.from("cuotas").select("id").match(check).maybeSingle()
  if (existing) return false

  const { error } = await supabase.from("cuotas").insert(newFee)
  if (error) throw error
  return true
}

export async function generarCuotas(formData: FormData) {
  const supabase = createServiceRoleClient()
  const rawData = Object.fromEntries(formData.entries())
  const validation = GenerarCuotasSchema.safeParse(rawData)

  if (!validation.success) return { success: false, message: "Datos inválidos." }

  const { mes, anio } = validation.data
  const fechaVencimiento = new Date(anio, mes, 10).toISOString().split('T')[0]

  let cuotasSocialesCreadas = 0
  let cuotasDeportivasCreadas = 0

  try {
    // --- PREPARACIÓN: OBTENER TODOS LOS DATOS ---
    const [tiposCuotaRes, gruposRes, miembrosRes, disciplinasRes, inscripcionesRes] = await Promise.all([
      supabase.from("cuotas_tipos").select("id, nombre, monto, tipo, por_disciplina").eq("activo", true),
      supabase.from("grupos_familiares").select("id"),
      supabase.from("miembros_familia").select("id, grupo_id"),
      supabase.from("disciplinas").select("id, cuota_deportiva"),
      supabase.from("inscripciones").select("miembro_id, disciplina_id").eq("activa", true),
    ])

    if (tiposCuotaRes.error) throw new Error(`Al buscar tipos de cuota: ${tiposCuotaRes.error.message}`)
    if (gruposRes.error) throw new Error(`Al buscar grupos: ${gruposRes.error.message}`)
    if (miembrosRes.error) throw new Error(`Al buscar miembros: ${miembrosRes.error.message}`)
    if (disciplinasRes.error) throw new Error(`Al buscar disciplinas: ${disciplinasRes.error.message}`)
    if (inscripcionesRes.error) throw new Error(`Al buscar inscripciones: ${inscripcionesRes.error.message}`)

    // --- MAPEO DE DATOS ---
    const tiposCuotaSocialMap = new Map(tiposCuotaRes.data.filter(t => !t.por_disciplina).map(t => [t.tipo, { id: t.id, monto: t.monto }]))
    const groupMembersMap = new Map<string, any[]>()
    miembrosRes.data.forEach(m => {
      if (m.grupo_id && !groupMembersMap.has(m.grupo_id)) groupMembersMap.set(m.grupo_id, [])
      if (m.grupo_id) groupMembersMap.get(m.grupo_id)!.push(m)
    })
    
    // --- 1. GENERACIÓN DE CUOTAS SOCIALES ---
    for (const grupo of gruposRes.data) {
      const miembros = groupMembersMap.get(grupo.id) || []
      const miembrosActivos = miembros.length
      if (miembrosActivos === 0) continue

      const tipoCuotaKey = miembrosActivos === 1 ? 'individual' : `gf${miembrosActivos}`
      const cuotaInfo = tiposCuotaSocialMap.get(tipoCuotaKey)
      if (!cuotaInfo) {
        console.warn(`Sin tipo de cuota para ${tipoCuotaKey}`)
        continue
      }

      const created = await createFeeIfNotExists(supabase, 
        { grupo_id: grupo.id, tipo: "social", mes, anio },
        { grupo_id: grupo.id, tipo: "social", mes, anio, monto: cuotaInfo.monto, fecha_vencimiento: fechaVencimiento, pagada: false }
      )
      if (created) cuotasSocialesCreadas++
    }

    // --- 2. GENERACIÓN DE CUOTAS DEPORTIVAS (LÓGICA CORREGIDA SEGÚN EL ESQUEMA) ---
    const miembroToGrupoMap = new Map(miembrosRes.data.map(m => [m.id, m.grupo_id]));
    const disciplinaPriceMap = new Map(disciplinasRes.data.map(d => [d.id, d.cuota_deportiva]));
    
    // Agregador: Key: "grupoId-disciplinaId", Value: { count: number }
    const groupDisciplineAggregator = new Map<string, { disciplina_id: string, grupo_id: string, member_count: number }>();

    for (const inscripcion of inscripcionesRes.data) {
        const grupo_id = miembroToGrupoMap.get(inscripcion.miembro_id);
        if (!grupo_id) continue;

        const key = `${grupo_id}-${inscripcion.disciplina_id}`;
        if (!groupDisciplineAggregator.has(key)) {
            groupDisciplineAggregator.set(key, {
                disciplina_id: inscripcion.disciplina_id,
                grupo_id: grupo_id,
                member_count: 0
            });
        }
        groupDisciplineAggregator.get(key)!.member_count += 1;
    }

    for (const [, data] of groupDisciplineAggregator.entries()) {
        const { grupo_id, disciplina_id, member_count } = data;
        const price = disciplinaPriceMap.get(disciplina_id);

        if (!price || price <= 0) continue;

        const totalMonto = price * member_count;

        const created = await createFeeIfNotExists(supabase,
            { grupo_id: grupo_id, disciplina_id: disciplina_id, tipo: "deportiva", mes, anio },
            { 
                grupo_id: grupo_id, 
                disciplina_id: disciplina_id, 
                tipo: "deportiva", 
                mes, 
                anio, 
                monto: totalMonto, 
                fecha_vencimiento: fechaVencimiento, 
                pagada: false 
            }
        );
        if (created) cuotasDeportivasCreadas++;
    }


    revalidatePath('/admin/historial-cuotas');

    return {
      success: true,
      message: `Proceso completado. Cuotas sociales creadas: ${cuotasSocialesCreadas}. Cuotas deportivas creadas: ${cuotasDeportivasCreadas}.`,
    }

  } catch (error: any) {
    console.error("Error en la generación de cuotas:", error)
    return {
      success: false,
      message: `Error en la generación: ${error.message}`,
    }
  }
}
