import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

// Definición de tipos para mayor claridad
interface GrupoFamiliar {
  id: string;
  cuota_social: number;
  titular_id: string;
}

interface TipoCuota {
  tipo: string;
  monto: number;
}

interface InscripcionTitular {
  socio_id: string;
  disciplinas: { id: string; cuota_deportiva: number };
}

interface InscripcionMiembro {
  miembros_familia: { grupo_id: string };
  disciplinas: { id: string; cuota_deportiva: number };
}

Deno.serve(async (req) => {
  // Manejo de la solicitud pre-vuelo (preflight) para CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const today = new Date();
    const mes = today.getMonth() + 1;
    const anio = today.getFullYear();
    const fecha_vencimiento = new Date(anio, mes - 1, 10).toISOString();

    let creadas = 0;
    let omitidas = 0;

    // 1. Obtener todos los grupos familiares
    const { data: grupos, error: gruposErr } = await supabase
      .from("grupos_familiares")
      .select("id, cuota_social, titular_id") as { data: GrupoFamiliar[] | null, error: any };

    if (gruposErr) throw new Error(`Error al obtener grupos: ${gruposErr.message}`);

    // 2. Obtener tipos de cuota activos
    const { data: tipos, error: tiposErr } = await supabase
      .from("cuotas_tipos")
      .select("tipo, monto")
      .eq("activo", true) as { data: TipoCuota[] | null, error: any };

    if (tiposErr) console.warn(`Advertencia: No se pudieron cargar los tipos de cuota: ${tiposErr.message}`);

    const mapaTipoMonto: Record<string, number> = (tipos || []).reduce((acc, t) => {
      acc[t.tipo] = Number(t.monto || 0);
      return acc;
    }, {} as Record<string, number>);

    // 3. Contar miembros por grupo para la cuota social
    const { data: miembros, error: miembrosErr } = await supabase
      .from("miembros_familia")
      .select("grupo_id");
      
    if (miembrosErr) console.warn(`Advertencia: No se pudieron contar los miembros: ${miembrosErr.message}`);

    const conteoMiembros: Record<string, number> = (miembros || []).reduce((acc, m) => {
      if (m.grupo_id) {
        acc[m.grupo_id] = (acc[m.grupo_id] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Funciones auxiliares para verificar existencia de cuotas
    const existeCuota = async (grupoId: string, tipo: 'social' | 'deportiva', disciplinaId?: string) => {
      let query = supabase
        .from("cuotas")
        .select("id", { count: "exact", head: true })
        .eq("grupo_id", grupoId)
        .eq("tipo", tipo)
        .eq("mes", mes)
        .eq("anio", anio);
      if (disciplinaId) {
        query = query.eq("disciplina_id", disciplinaId);
      }
      const { count } = await query;
      return (count ?? 0) > 0;
    };

    // 4. Generar cuotas sociales
    for (const g of grupos || []) {
      if (!g || !g.id || await existeCuota(g.id, 'social')) {
        if (g && g.id) omitidas++;
        continue;
      }

      const miembrosCount = (conteoMiembros[g.id] || 0) + 1; // +1 por el titular
      const subtipo = miembrosCount <= 1 ? "individual" : "gf1";
      const monto = Number(mapaTipoMonto[subtipo] ?? g.cuota_social ?? 0);

      if (monto <= 0) {
        omitidas++;
        continue;
      }

      const { error: insErr } = await supabase.from("cuotas").insert({
        grupo_id: g.id,
        tipo: "social",
        mes,
        anio,
        monto,
        fecha_vencimiento,
        pagada: false,
      });

      if (insErr) console.warn(`Error al insertar cuota social para grupo ${g.id}: ${insErr.message}`);
      else creadas++;
    }

    // 5. Generar cuotas deportivas
    const { data: inscripciones, error: insErr } = await supabase
      .from("inscripciones")
      .select(`
        disciplina_id,
        socio_id,
        miembro_id,
        disciplinas (id, cuota_deportiva),
        miembros_familia (grupo_id),
        profiles (grupos_familiares!profiles_titular_id_fkey(id))
      `)
      .eq("activo", true);
      
    if (insErr) throw new Error(`Error al obtener inscripciones: ${insErr.message}`);

    const mapaTitularGrupo = (grupos || []).reduce((acc, g) => {
      if (g.titular_id) acc[g.titular_id] = g.id;
      return acc;
    }, {} as Record<string, string>);

    for (const i of inscripciones || []) {
      const disciplina = (i as any).disciplinas;
      if (!disciplina?.id) continue;
      
      let grupoId: string | undefined;
      if (i.socio_id) { // Es titular
        grupoId = mapaTitularGrupo[i.socio_id];
      } else if (i.miembro_id && (i as any).miembros_familia) { // Es miembro
        grupoId = (i as any).miembros_familia.grupo_id;
      }

      if (!grupoId) continue;

      if (await existeCuota(grupoId, 'deportiva', disciplina.id)) {
        omitidas++;
        continue;
      }

      const monto = Number(mapaTipoMonto["deportiva"] ?? disciplina.cuota_deportiva ?? 0);
      if (monto <= 0) continue;

      const { error: insDepErr } = await supabase.from("cuotas").insert({
        grupo_id: grupoId,
        disciplina_id: disciplina.id,
        tipo: "deportiva",
        mes,
        anio,
        monto,
        fecha_vencimiento,
        pagada: false,
      });

      if (insDepErr) console.warn(`Error al insertar cuota deportiva para grupo ${grupoId}: ${insDepErr.message}`);
      else creadas++;
    }

    return new Response(JSON.stringify({ success: true, creadas, omitidas }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});