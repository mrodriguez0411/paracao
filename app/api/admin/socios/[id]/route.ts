import { createServiceRoleClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: grupoId } = await params
    const supabase = createServiceRoleClient()

    console.log("[socios-get] Obteniendo datos del socio:", grupoId)

    const { data, error } = await supabase
      .from("grupos_familiares")
      .select(
        `
        id,
        nombre,
        cuota_social,
        created_at,
        profiles:titular_id (
          id,
          nombre_completo,
          email,
          dni,
          telefono
        ),
        miembros_familia (id, nombre_completo, dni, parentesco, socio_id, inscripciones (disciplina_id, disciplinas (id, nombre)))
      `
      )
      .eq("id", grupoId)
      .single()

    if (error) {
      console.error("[socios-get] Error al obtener socio:", error)
      return NextResponse.json({ error: "Socio no encontrado" }, { status: 404 })
    }

    // Obtener inscripciones del titular localizando su registro en miembros_familia (socio_id = titular)
    let titular_inscripciones: any[] = []
    const titularProfileId = (data as any)?.profiles?.id
    if (titularProfileId) {
      let titularMiembroId: string | null = null
      // 1) Buscar por socio_id
      const { data: titularMiembro1 } = await supabase
        .from("miembros_familia")
        .select("id")
        .eq("grupo_id", grupoId)
        .eq("socio_id", titularProfileId)
        .maybeSingle()
      titularMiembroId = (titularMiembro1 as any)?.id || null

      // 2) Si no existe, buscar por parentesco 'Titular'
      if (!titularMiembroId) {
        const { data: titularMiembro2 } = await supabase
          .from("miembros_familia")
          .select("id")
          .eq("grupo_id", grupoId)
          .eq("parentesco", "Titular")
          .maybeSingle()
        titularMiembroId = (titularMiembro2 as any)?.id || null
      }

      // 3) Si aún no existe, intentar por coincidencia de DNI o nombre con el titular
      if (!titularMiembroId) {
        const titularDni = (data as any)?.profiles?.dni || null
        const titularNombre = (data as any)?.profiles?.nombre_completo || null
        if (titularDni || titularNombre) {
          const { data: mfCandidatos } = await supabase
            .from("miembros_familia")
            .select("id, dni, nombre_completo")
            .eq("grupo_id", grupoId)

          const candidato = (mfCandidatos as any[])?.find(
            (m) => (titularDni && m.dni === titularDni) || (titularNombre && m.nombre_completo === titularNombre)
          )
          titularMiembroId = candidato?.id || null
        }
      }

      if (titularMiembroId) {
        const { data: inscTitular, error: errInsc } = await supabase
          .from("inscripciones")
          .select("disciplina_id, disciplinas (id, nombre)")
          .eq("miembro_id", titularMiembroId)

        if (!errInsc && inscTitular) {
          titular_inscripciones = inscTitular
        } else if (errInsc) {
          console.warn("[socios-get] No se pudieron obtener inscripciones del titular:", errInsc)
        }
      }
    }

    return NextResponse.json({ ...data, titular_inscripciones })
  } catch (error) {
    console.error("[socios-get] Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: grupoId } = await params
    const body = await request.json()
    const { nombre_grupo, nombre_completo, dni, telefono, cuota_social, titular_disciplinas } = body

    console.log("[socios-update] Actualizando socio:", grupoId)

    if (!nombre_grupo || !nombre_completo || !dni || !cuota_social) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      )
    }

    const supabase = createServiceRoleClient()

    // Obtener el ID del titular
    const { data: grupoData, error: grupoError } = await supabase
      .from("grupos_familiares")
      .select("titular_id")
      .eq("id", grupoId)
      .single()

    if (grupoError || !grupoData) {
      console.error("[socios-update] Error al obtener grupo:", grupoError)
      return NextResponse.json({ error: "Socio no encontrado" }, { status: 404 })
    }

    const titularId = grupoData.titular_id

    // Actualizar grupo familiar
    console.log("[socios-update] Actualizando grupo familiar...")
    const { error: updateGrupoError } = await supabase
      .from("grupos_familiares")
      .update({
        nombre: nombre_grupo,
        cuota_social: Number.parseFloat(cuota_social),
        updated_at: new Date().toISOString(),
      })
      .eq("id", grupoId)

    if (updateGrupoError) {
      console.error("[socios-update] Error al actualizar grupo:", updateGrupoError)
      throw new Error(`Error al actualizar grupo: ${updateGrupoError.message}`)
    }

    // Actualizar perfil (nombre, dni, telefono) y email si viene
    console.log("[socios-update] Actualizando perfil y email si corresponde...")
    const updateData: any = { nombre_completo, dni }
    if (telefono) updateData.telefono = telefono

    // Si el body trae email, intentamos actualizar también en auth y en profiles
    if (body.email) {
      try {
        // Intentar actualizar email en auth (no bloquear si falla)
        // @ts-ignore - admin API
        await supabase.auth.admin.updateUserById(titularId, { email: body.email })
      } catch (e) {
        console.warn("[socios-update] No se pudo actualizar email en auth:", e)
      }
      updateData.email = body.email
    }

    const { error: updateProfileError } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", titularId)

    if (updateProfileError) {
      console.error("[socios-update] Error al actualizar perfil:", updateProfileError)
      throw new Error(`Error al actualizar perfil: ${updateProfileError.message}`)
    }

    // Sincronizar disciplinas del titular si vienen (vinculadas al miembro con parentesco 'Titular')
    console.log("[socios-update] titular_disciplinas recibidas:", Array.isArray(titular_disciplinas) ? titular_disciplinas : null)
    if (Array.isArray(titular_disciplinas)) {
      // Asegurar miembro titular por parentesco
      let titularMiembroId: string | null = null
      const { data: titularByPar, error: errTitPar } = await supabase
        .from("miembros_familia")
        .select("id")
        .eq("grupo_id", grupoId)
        .eq("parentesco", "Titular")
        .maybeSingle()

      if (titularByPar?.id) {
        titularMiembroId = titularByPar.id
      } else {
        // crear registro básico del titular como miembro (sin socio_id por compatibilidad de esquema)
        const { data: mfNew, error: mfErr } = await supabase
          .from("miembros_familia")
          .insert({ grupo_id: grupoId, nombre_completo: nombre_completo, dni, parentesco: "Titular" })
          .select()
        if (mfErr) {
          console.error("[socios-update] Error al crear miembro titular:", mfErr)
          throw new Error(`Error al crear miembro titular: ${mfErr.message}`)
        }
        titularMiembroId = (mfNew as any)?.[0]?.id || null
      }

      console.log("[socios-update] titularMiembroId:", titularMiembroId)
      if (titularMiembroId) {
        // eliminar inscripciones previas del titular
        await supabase.from("inscripciones").delete().eq("miembro_id", titularMiembroId)
        // insertar nuevas
        const toInsertTitular = titular_disciplinas.map((discId: string) => ({ miembro_id: titularMiembroId, disciplina_id: discId }))
        if (toInsertTitular.length > 0) {
          const { error: inscTitErr } = await supabase.from("inscripciones").insert(toInsertTitular)
          if (inscTitErr) {
            console.error("[socios-update] Error al insertar inscripciones del titular:", inscTitErr)
            throw new Error(`Error al insertar inscripciones del titular: ${inscTitErr.message}`)
          }
        }
      }
    }

    // Manejar miembros: crear/actualizar/eliminar y sincronizar inscripciones
    if (Array.isArray(body.miembros)) {
      const miembrosPayload: any[] = body.miembros

      // Obtener miembros actuales del grupo
      const { data: existentes = [], error: errExist } = await supabase
        .from("miembros_familia")
        .select("id")
        .eq("grupo_id", grupoId)

      if (errExist) {
        console.error("[socios-update] Error al obtener miembros existentes:", errExist)
        throw new Error(`Error al obtener miembros existentes: ${errExist.message}`)
      }

      const existentesIds = new Set((existentes as any[]).map((r) => r.id))
      const payloadIds = new Set(miembrosPayload.filter((m) => m.id).map((m) => m.id))

      // Eliminar miembros que ya no están en el payload
      const toDelete = Array.from(existentesIds).filter((id) => !payloadIds.has(id))
      if (toDelete.length > 0) {
        await supabase.from("miembros_familia").delete().in("id", toDelete)
      }

      // Upsert miembros y sincronizar inscripciones
      for (const miembro of miembrosPayload) {
        let miembroId = miembro.id
        if (miembroId) {
          // actualizar
          const { error: upErr } = await supabase
            .from("miembros_familia")
            .update({ nombre_completo: miembro.nombre_completo, dni: miembro.dni, parentesco: miembro.parentesco })
            .eq("id", miembroId)

          if (upErr) {
            console.error("[socios-update] Error al actualizar miembro:", upErr)
            throw new Error(`Error al actualizar miembro: ${upErr.message}`)
          }
        } else {
          // insertar
          const { data: newMemberData, error: insErr } = await supabase
            .from("miembros_familia")
            .insert({ nombre_completo: miembro.nombre_completo, dni: miembro.dni, parentesco: miembro.parentesco, grupo_id: grupoId })
            .select()

          if (insErr) {
            console.error("[socios-update] Error al insertar miembro:", insErr)
            throw new Error(`Error al insertar miembro: ${insErr.message}`)
          }

          miembroId = newMemberData?.[0]?.id
        }

        // Sincronizar inscripciones (disciplinas) si vienen
        if (Array.isArray(miembro.disciplinas)) {
          // eliminar existentes
          await supabase.from("inscripciones").delete().eq("miembro_id", miembroId)

          // insertar nuevas
          const toInsert = miembro.disciplinas.map((discId: string) => ({ miembro_id: miembroId, disciplina_id: discId }))
          if (toInsert.length > 0) {
            const { error: inscErr } = await supabase.from("inscripciones").insert(toInsert)
            if (inscErr) {
              console.error("[socios-update] Error al insertar inscripciones:", inscErr)
              throw new Error(`Error al insertar inscripciones: ${inscErr.message}`)
            }
          }
        }
      }
    }

    console.log("[socios-update] Socio actualizado exitosamente")

    return NextResponse.json({
      success: true,
      message: "Socio actualizado correctamente",
    })
  } catch (error) {
    console.error("[socios-update] Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 }
    )
  }
}
