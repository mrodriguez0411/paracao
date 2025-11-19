import { NextRequest, NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { mes, anio, fecha_vencimiento } = await request.json()
    if (!mes || !anio) {
      return NextResponse.json({ error: "mes y anio son requeridos" }, { status: 400 })
    }

    const supabase = createServiceRoleClient()

    // 1) Traer grupos con cuota social
    const { data: grupos, error: gruposErr } = await supabase
      .from("grupos_familiares")
      .select("id, cuota_social, titular_id")

    if (gruposErr) {
      console.error("[cuotas-generar] Error grupos:", gruposErr)
      return NextResponse.json({ error: "No se pudieron cargar grupos" }, { status: 500 })
    }

    const venc = fecha_vencimiento || new Date(anio, mes - 1, 10).toISOString()

    let creadas = 0
    let omitidas = 0

    // 1b) Leer tipos de cuota configurables (si existen)
    const { data: tipos, error: tiposErr } = await supabase
      .from("cuotas_tipos")
      .select("tipo, monto, por_disciplina, activo")
      .eq("activo", true)
      .order("tipo")

    if (tiposErr) {
      console.warn("[cuotas-generar] cuotas_tipos no disponible o error:", tiposErr.message)
    }

    const mapaTipoMonto: Record<string, number> = {}
    for (const t of tipos || []) {
      if (t && t.tipo) mapaTipoMonto[t.tipo] = Number(t.monto || 0)
    }

    // 1c) Contar miembros por grupo para decidir subtipo social básico (individual vs gf1)
    const { data: miembros, error: miembrosErr } = await supabase
      .from("miembros_familia")
      .select("grupo_id")

    if (miembrosErr) {
      console.warn("[cuotas-generar] No se pudieron leer miembros_familia:", miembrosErr.message)
    }

    const conteoMiembros: Record<string, number> = {}
    for (const m of miembros || []) {
      if (!m?.grupo_id) continue
      conteoMiembros[m.grupo_id] = (conteoMiembros[m.grupo_id] || 0) + 1
    }

    // Helper: verifica existencia
    async function existeCuotaSocial(grupoId: string) {
      const { data } = await supabase
        .from("cuotas")
        .select("id")
        .eq("grupo_id", grupoId)
        .eq("tipo", "social")
        .eq("mes", mes)
        .eq("anio", anio)
        .limit(1)
      return Array.isArray(data) && data.length > 0
    }

    async function existeCuotaDeportiva(grupoId: string, disciplinaId: string) {
      const { data } = await supabase
        .from("cuotas")
        .select("id")
        .eq("grupo_id", grupoId)
        .eq("disciplina_id", disciplinaId)
        .eq("tipo", "deportiva")
        .eq("mes", mes)
        .eq("anio", anio)
        .limit(1)
      return Array.isArray(data) && data.length > 0
    }

    // 2) Insertar cuota social por grupo si no existe
    for (const g of grupos || []) {
      if (!g || !g.id) continue
      const ya = await existeCuotaSocial(g.id)
      if (ya) { omitidas++; continue }
      // Determinar subtipo social básico: individual si 1 miembro total, sino gf1 (reglas ampliables)
      const miembrosCount = (conteoMiembros[g.id] || 0) + 1 // +1 titular
      const subtipo: "individual" | "gf1" = miembrosCount <= 1 ? "individual" : "gf1"

      // Buscar monto por subtipo desde cuotas_tipos, fallback a g.cuota_social
      const montoConf = mapaTipoMonto[subtipo]
      const monto = Number(montoConf ?? g.cuota_social ?? 0)
      if (monto <= 0) { omitidas++; continue }
      const { error: insErr } = await supabase.from("cuotas").insert({
        grupo_id: g.id,
        tipo: "social",
        mes,
        anio,
        monto,
        fecha_vencimiento: venc,
        pagada: false,
      })
      if (!insErr) creadas++; else { console.warn("[cuotas-generar] social err", insErr); }
    }

    // 3) Cuotas deportivas por inscripciones del titular y miembros
    // 3a) Titulares: inscripciones con socio_id = titular
    const { data: inscTit, error: errInscTit } = await supabase
      .from("inscripciones")
      .select("disciplina_id, socio_id, disciplinas (id, cuota_deportiva), profiles!inscripciones_socio_id_fkey (id), grupos_familiares!profiles_titular_id_fkey (id)")

    if (errInscTit) {
      console.error("[cuotas-generar] Error inscripciones titular:", errInscTit)
    }

    // 3b) Miembros: inscripciones con miembro_id -> join a miembro.grupo_id
    const { data: inscMbr, error: errInscMbr } = await supabase
      .from("inscripciones")
      .select("disciplina_id, miembro_id, disciplinas (id, cuota_deportiva), miembros_familia (grupo_id)")

    if (errInscMbr) {
      console.error("[cuotas-generar] Error inscripciones miembros:", errInscMbr)
    }

    // Mapeo de grupo y disciplina para ambos casos
    const deportivas: Array<{ grupo_id: string; disciplina_id: string; monto: number }> = []

    // Titulares: necesitamos mapear socio_id -> grupo_id (grupos_familiares donde titular_id = socio_id)
    // La selección arriba intenta traer relación hasta grupos_familiares; pero si no está configurado ese alias, haremos otra consulta simple.
    // Fallback: construir mapa titular->grupo
    const mapaTitularGrupo: Record<string, string> = {}
    for (const g of grupos || []) {
      if (g?.titular_id) mapaTitularGrupo[g.titular_id] = g.id
    }

    for (const it of inscTit || []) {
      const grupoId = mapaTitularGrupo[(it as any).socio_id]
      const disc = (it as any).disciplinas
      if (!grupoId || !disc?.id) continue
      // Monto deportivo: usar cuotas_tipos.deportiva si existe, sino fallback a disciplina
      const monto = Number((mapaTipoMonto["deportiva"] ?? disc.cuota_deportiva) || 0)
      if (monto <= 0) continue
      deportivas.push({ grupo_id: grupoId, disciplina_id: String(disc.id), monto })
    }

    for (const im of inscMbr || []) {
      const grupoId = (im as any).miembros_familia?.grupo_id
      const disc = (im as any).disciplinas
      if (!grupoId || !disc?.id) continue
      const monto = Number((mapaTipoMonto["deportiva"] ?? disc.cuota_deportiva) || 0)
      if (monto <= 0) continue
      deportivas.push({ grupo_id: String(grupoId), disciplina_id: String(disc.id), monto })
    }

    // Insertar deportivas evitando duplicados
    for (const d of deportivas) {
      const ya = await existeCuotaDeportiva(d.grupo_id, d.disciplina_id)
      if (ya) { omitidas++; continue }
      const { error: insDepErr } = await supabase.from("cuotas").insert({
        grupo_id: d.grupo_id,
        disciplina_id: d.disciplina_id,
        tipo: "deportiva",
        mes,
        anio,
        monto: d.monto,
        fecha_vencimiento: venc,
        pagada: false,
      })
      if (!insDepErr) creadas++; else { console.warn("[cuotas-generar] deportiva err", insDepErr) }
    }

    return NextResponse.json({ success: true, creadas, omitidas })
  } catch (error) {
    console.error("[cuotas-generar] Error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error desconocido" }, { status: 500 })
  }
}
