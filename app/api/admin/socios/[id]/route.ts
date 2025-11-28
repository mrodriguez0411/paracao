import { createServiceRoleClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// --- Handler para GET (sin cambios) ---
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id: grupoId } = params;
    const supabase = createServiceRoleClient();

    const { data, error } = await supabase
      .from("grupos_familiares")
      .select(`
        id, nombre, tipo_cuota_id,
        cuotas_tipos (id, nombre, monto),
        profiles:titular_id (id, nombre_completo, email, dni, telefono),
        miembros_familia (id, nombre_completo, dni, parentesco, socio_id, inscripciones (disciplina_id, disciplinas (id, nombre)))
      `)
      .eq("id", grupoId)
      .single();

    if (error) {
      console.error("[socios-get] Error al obtener socio:", error);
      return NextResponse.json({ error: "Socio no encontrado" }, { status: 404 });
    }

    const titularProfileId = (data as any)?.profiles?.id;
    let titular_inscripciones: any[] = [];
    if (titularProfileId) {
        const { data: titularMiembro } = await supabase
            .from("miembros_familia")
            .select("id")
            .eq("socio_id", titularProfileId)
            .eq("grupo_id", grupoId)
            .maybeSingle();

        if (titularMiembro?.id) {
            const { data: inscTitular, error: errInsc } = await supabase
                .from("inscripciones")
                .select("disciplina_id, disciplinas (id, nombre)")
                .eq("miembro_id", titularMiembro.id);
            if (!errInsc) titular_inscripciones = inscTitular || [];
        }
    }

    return NextResponse.json({ ...data, titular_inscripciones });

  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 500 });
  }
}

// --- Handler para PUT (CORREGIDO Y SIMPLIFICADO) ---
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const { id: grupoId } = params;
  const supabase = createServiceRoleClient();

  try {
    const body = await request.json();
    const {
      nombre_grupo,
      nombre_completo,
      dni,
      telefono,
      email,
      tipo_cuota_id,
      miembros,
      titular_disciplinas,
    } = body;

    // 1. Obtener datos del grupo y titular para IDs
    const { data: grupoData, error: grupoError } = await supabase
      .from("grupos_familiares")
      .select("titular_id")
      .eq("id", grupoId)
      .single();

    if (grupoError) throw new Error("Grupo familiar no encontrado");
    const titularId = grupoData.titular_id;

    // 2. Actualizar tabla `grupos_familiares`
    await supabase.from("grupos_familiares").update({ nombre: nombre_grupo, tipo_cuota_id }).eq("id", grupoId);

    // 3. Actualizar tabla `profiles` del titular
    await supabase.from("profiles").update({ nombre_completo, dni, telefono, email }).eq("id", titularId);
    
    // 4. Actualizar email en `auth.users`
    if (email) {
        await supabase.auth.admin.updateUserById(titularId, { email });
    }

    // 5. Sincronizar miembros y sus disciplinas (LÓGICA CORREGIDA)
    if (Array.isArray(miembros)) {
      const { data: miembrosActuales } = await supabase.from("miembros_familia").select("id").eq("grupo_id", grupoId);
      const idsActuales = (miembrosActuales || []).map(m => m.id);
      const idsPayload = miembros.map(m => m.id).filter(Boolean);

      // Eliminar miembros que ya no están en el payload
      const idsAEliminar = idsActuales.filter(id => !idsPayload.includes(id));
      if (idsAEliminar.length > 0) {
        await supabase.from("miembros_familia").delete().in("id", idsAEliminar);
      }

      // Actualizar o Insertar miembros
      for (const miembro of miembros) {
        const { disciplinas, ...miembroData } = miembro;

        let miembroId = miembro.id;

        if (miembroId) {
          // Actualizar miembro existente
          await supabase.from("miembros_familia").update(miembroData).eq("id", miembroId);
        } else {
          // Insertar nuevo miembro
          const { data: nuevoMiembro, error: insertError } = await supabase
            .from("miembros_familia")
            .insert({ ...miembroData, grupo_id: grupoId })
            .select("id")
            .single();
          if (insertError) throw new Error("No se pudo crear un nuevo miembro");
          miembroId = nuevoMiembro.id;
        }

        // Sincronizar disciplinas para este miembro
        if (miembroId && Array.isArray(disciplinas)) {
          await supabase.from("inscripciones").delete().eq("miembro_id", miembroId);
          if (disciplinas.length > 0) {
            const inscripcionesNuevas = disciplinas.map(disciplina_id => ({ miembro_id: miembroId, disciplina_id }));
            await supabase.from("inscripciones").insert(inscripcionesNuevas);
          }
        }
      }
    }
    
    // 6. Sincronizar disciplinas del titular (buscando el miembro titular)
    if (Array.isArray(titular_disciplinas)) {
        const { data: miembroTitular } = await supabase.from("miembros_familia").select("id").eq("socio_id", titularId).eq("grupo_id", grupoId).maybeSingle();
        
        if(miembroTitular?.id){
            await supabase.from("inscripciones").delete().eq("miembro_id", miembroTitular.id);
            if(titular_disciplinas.length > 0){
                const inscripcionesTitular = titular_disciplinas.map(disciplina_id => ({ miembro_id: miembroTitular.id, disciplina_id }));
                await supabase.from("inscripciones").insert(inscripcionesTitular);
            }
        } else {
          // Si el titular no existe como miembro, también se lo debe actualizar
          await supabase.from("miembros_familia").update({ nombre_completo, dni }).eq("grupo_id", grupoId).eq("parentesco", "Titular");
        }
    }

    return NextResponse.json({ success: true, message: "Socio actualizado correctamente" });

  } catch (error) {
    console.error("[socios-update] Error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error desconocido" }, { status: 500 });
  }
}
