import { createServiceRoleClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

async function crearUsuario(supabase: any, email: string, password: string, nombre_completo: string) {
  console.log("[crear-socio] Creando usuario en auth...")
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    user_metadata: {
      nombre_completo,
      rol: "socio",
    },
    email_confirm: true,
  })

  if (authError) {
    console.error("[crear-socio] Error al crear usuario:", authError)
    throw new Error(`Error al crear usuario: ${authError.message}`)
  }

  if (!authData.user) {
    throw new Error("No se pudo crear el usuario")
  }

  return authData.user
}

async function actualizarPerfil(supabase: any, userId: string, telefono: string, dni: string) {
  console.log("[crear-socio] Actualizando perfil...")
  const updateData: any = { dni }
  if (telefono) {
    updateData.telefono = telefono
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", userId)

  if (profileError) {
    console.error("[crear-socio] Error al actualizar perfil:", profileError)
    throw new Error(`Error al actualizar perfil: ${profileError.message}`)
  }
}

async function crearGrupoFamiliar(supabase: any, nombre_grupo: string, titular_id: string, tipo_cuota_id: string) {
  console.log("[crear-socio] Creando grupo familiar...")
  const { data: grupoData, error: grupoError } = await supabase
    .from("grupos_familiares")
    .insert({
      nombre: nombre_grupo,
      titular_id,
      tipo_cuota_id: tipo_cuota_id,
    })
    .select()

  if (grupoError) {
    console.error("[crear-socio] Error al crear grupo:", grupoError)
    throw new Error(`Error al crear grupo familiar: ${grupoError.message}`)
  }

  return grupoData?.[0]?.id
}

async function crearMiembrosFamiliares(supabase: any, grupoId: string, miembros: any[]) {
  if (!miembros || miembros.length === 0) {
    return
  }

  console.log(`[crear-socio] Creando ${miembros.length} miembros familiares...`)

  const miembrosData = miembros.map((miembro: any) => ({
    grupo_id: grupoId,
    nombre_completo: miembro.nombre_completo,
    dni: miembro.dni,
    parentesco: miembro.parentesco || null,
  }))

  const { data: insertados, error: miembrosError } = await supabase
    .from("miembros_familia")
    .insert(miembrosData)
    .select("id, nombre_completo") // Seleccionamos ID y nombre para referencia

  if (miembrosError) {
    console.error("[crear-socio] Error al crear miembros familiares:", miembrosError)
    throw new Error(`Error al crear miembros familiares: ${miembrosError.message}`)
  }

  // Crear inscripciones de miembros si vienen disciplinas
  if (Array.isArray(miembros) && Array.isArray(insertados)) {
    const inscripcionesParaCrear: any[] = []
    for (let i = 0; i < miembros.length; i++) {
      const miembroOriginal = miembros[i]
      const miembroInsertado = insertados[i]

      if (!miembroInsertado || !miembroOriginal) continue
      
      const disciplinasDelMiembro = Array.isArray(miembroOriginal.disciplinas) ? miembroOriginal.disciplinas : []
      
      console.log(`[crear-socio] Procesando ${disciplinasDelMiembro.length} disciplinas para ${miembroInsertado.nombre_completo}...`)

      for (const disciplinaId of disciplinasDelMiembro) {
        if (typeof disciplinaId === 'string' && disciplinaId) {
          inscripcionesParaCrear.push({ 
            miembro_id: miembroInsertado.id, 
            disciplina_id: disciplinaId 
          });
          console.log(`[crear-socio] Preparando inscripción: Miembro=${miembroInsertado.id}, Disciplina=${disciplinaId}`);
        } else {
          console.warn(`[crear-socio] Se omitió una disciplina con ID inválido:`, disciplinaId);
        }
      }
    }

    if (inscripcionesParaCrear.length > 0) {
      console.log(`[crear-socio] Insertando ${inscripcionesParaCrear.length} inscripciones en la base de datos...`);
      const { error: inscErr } = await supabase.from("inscripciones").insert(inscripcionesParaCrear)
      if (inscErr) {
        console.error("[crear-socio] No se pudieron crear las inscripciones de miembros:", inscErr)
      }
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, nombre_completo, dni, telefono, nombre_grupo, tipo_cuota_id, miembros, titular_disciplinas } = body

    console.log("[crear-socio] Iniciando con datos:", { email, nombre_completo, dni, nombre_grupo, miembros })

    if (!email || !password || !nombre_completo || !dni || !nombre_grupo || !tipo_cuota_id) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      )
    }

    const supabase = createServiceRoleClient()

    const user = await crearUsuario(supabase, email, password, nombre_completo)
    console.log("[crear-socio] Usuario creado:", user.id)

    await actualizarPerfil(supabase, user.id, telefono, dni)

    const grupoId = await crearGrupoFamiliar(supabase, nombre_grupo, user.id, tipo_cuota_id)
    console.log("[crear-socio] Grupo creado exitosamente")

    await crearMiembrosFamiliares(supabase, grupoId, miembros)

    // ------ BLOQUE CORREGIDO ------
    // Asegurar miembro titular y crear inscripciones del titular.
    // Se elimina el `.single()` y se maneja la respuesta como un array.
    let titularMiembroId: string | null = null
    {
      const { data: mfTit, error: mfTitErr } = await supabase
        .from("miembros_familia")
        .insert({ grupo_id: grupoId, nombre_completo, dni, parentesco: "Titular", socio_id: user.id })
        .select('id') // El insert().select() devuelve un array

      if (mfTitErr) {
        console.warn("[crear-socio] No se pudo crear miembro titular (puede existir):", mfTitErr.message)
        const { data: mfExist } = await supabase
          .from("miembros_familia")
          .select("id")
          .eq("grupo_id", grupoId)
          .eq("socio_id", user.id)
          .maybeSingle()
        titularMiembroId = (mfExist as any)?.id || null
      } else {
        // Accedemos al primer elemento del array, como en el código original.
        titularMiembroId = mfTit?.[0]?.id || null
      }
    }
    // ------ FIN BLOQUE CORREGIDO ------

    if (titularMiembroId && Array.isArray(titular_disciplinas)) {
      if (titular_disciplinas.length > 0) {
        const payload = titular_disciplinas.map((discId: string) => ({ miembro_id: titularMiembroId as string, disciplina_id: discId }))
        const { error: inscTitErr } = await supabase.from("inscripciones").insert(payload)
        if (inscTitErr) {
          console.warn("[crear-socio] No se pudieron crear inscripciones del titular:", inscTitErr)
        }
      }
    }

    return NextResponse.json({
      success: true,
      user_id: user.id,
      email: user.email,
    })
  } catch (error) {
    console.error("[crear-socio] Error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    )
  }
}
