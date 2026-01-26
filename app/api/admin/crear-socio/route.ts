import { createServiceRoleClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

// --- Helper Functions (modularized for clarity) ---

async function crearUsuario(supabase: any, email: string, password: string, nombre: string, apellido: string) {
  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { nombre, apellido, nombre_completo: `${nombre} ${apellido}`.trim(), rol: "socio" },
      email_confirm: true,
    })
    if (error || !data?.user) {
      const msg = String(error?.message || '')
      // Mapear errores comunes a mensajes claros
      if (msg.toLowerCase().includes('already') || msg.toLowerCase().includes('duplicate')) {
        const e = new Error('EMAIL_TAKEN')
        ;(e as any).status = 409
        throw e
      }
      throw new Error(msg || 'No se pudo crear el usuario')
    }
    return data.user
  } catch (err) {
    console.error('[crearUsuario] Error:', err)
    throw err
  }
}

async function actualizarPerfil(supabase: any, userId: string, telefono: string | null, dni: string, fecha_nacimiento: string | null, nombre?: string, apellido?: string) {
  const profileData: { dni: string, fecha_nacimiento: string | null, telefono: string | null, nombre?: string, apellido?: string } = {
    dni,
    fecha_nacimiento: fecha_nacimiento,
    telefono: telefono,
  };
  if (nombre !== undefined) profileData.nombre = nombre
  if (apellido !== undefined) profileData.apellido = apellido

  const { error } = await supabase.from("profiles").update(profileData).eq("id", userId)
  if (error) throw new Error(`Error al actualizar perfil: ${error.message}`)
}

async function crearGrupoFamiliar(supabase: any, nombre_grupo: string, titular_id: string, tipo_cuota_id: string) {
  const { data, error } = await supabase.from("grupos_familiares").insert({ nombre: nombre_grupo, titular_id, tipo_cuota_id }).select("id").single()
  if (error || !data) throw new Error(`Error al crear grupo familiar: ${error.message}`)
  return data.id
}

async function crearMiembrosConInscripciones(supabase: any, grupoId: string, miembros: any[]) {
  if (!miembros || miembros.length === 0) return []

  const miembrosParaInsertar = miembros.map(m => ({
    grupo_id: grupoId,
    nombre: m.nombre?.trim() || '',
    apellido: m.apellido?.trim() || '',
    dni: m.dni,
    parentesco: m.parentesco || null,
    fecha_nacimiento: m.fecha_nacimiento,
  }))

  const { data: miembrosInsertados, error: miembrosError } = await supabase
    .from("miembros_familia")
    .insert(miembrosParaInsertar)
    .select("id, nombre, apellido")
  if (miembrosError) throw new Error(`Error al crear miembros: ${miembrosError.message}`)

  // Map activities -> disciplinas for inscriptions
  let inscripcionesParaCrear: { miembro_id: string, disciplina_id: string }[] = []
  for (let i = 0; i < miembros.length; i++) {
    const miembroOriginal = miembros[i]
    const miembroInsertado = miembrosInsertados[i]
    if (!miembroInsertado || !Array.isArray(miembroOriginal.actividades) || miembroOriginal.actividades.length === 0) continue
    const { data: acts, error: actsErr } = await supabase
      .from('actividades')
      .select('id, disciplina_id')
      .in('id', miembroOriginal.actividades)
    if (!actsErr && Array.isArray(acts)) {
      inscripcionesParaCrear.push(
        ...acts
          .filter((a: { id: string; disciplina_id: string | null }) => a?.disciplina_id)
          .map((a: { id: string; disciplina_id: string | null }) => ({ miembro_id: miembroInsertado.id, disciplina_id: a.disciplina_id as string }))
      )
    }
  }

  if (inscripcionesParaCrear.length > 0) {
    const { error: inscError } = await supabase.from("inscripciones").insert(inscripcionesParaCrear)
    if (inscError) console.warn(`[crear-socio] No se pudieron crear algunas inscripciones de miembros:`, inscError.message)
  }
  
  return miembrosInsertados
}

async function crearInscripciones(supabase: any, miembroId: string, actividadIds: string[]) {
  if (!miembroId || !actividadIds || actividadIds.length === 0) return

  // Convertir actividades -> disciplina_id
  const { data: acts, error: actsErr } = await supabase
    .from('actividades')
    .select('id, disciplina_id')
    .in('id', actividadIds)
  if (actsErr) {
    console.warn('[crear-socio] No se pudieron resolver disciplinas desde actividades:', actsErr.message)
    return
  }
  const payload = ((acts || []) as { id: string; disciplina_id: string | null }[])
    .filter((a) => a?.disciplina_id)
    .map((a) => ({ miembro_id: miembroId, disciplina_id: a.disciplina_id as string }))

  if (payload.length === 0) return
  const { error } = await supabase.from('inscripciones').insert(payload)
  if (error) console.warn(`[crear-socio] No se pudieron crear inscripciones para el miembro ${miembroId}:`, error.message)
}

// --- Main POST Handler ---

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      email, password, nombre, apellido, dni, telefono, 
      nombre_grupo, tipo_cuota_id, fecha_nacimiento, 
      miembros, 
      titular_actividades, 
    } = body

    if (!email || !password || !nombre || !apellido || !dni || !nombre_grupo || !tipo_cuota_id) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    // columnas separadas en la BD: nombre y apellido

    const supabase = createServiceRoleClient()

    // 0. Validación previa: email ya registrado (evitar error de Auth)
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle()
    if (existingProfile?.id) {
      return NextResponse.json({ error: 'El email ya se encuentra registrado' }, { status: 409 })
    }

    // 1. Create Auth User & Profile
    // Validación: mínimo 6 caracteres (según configuración mostrada)
    if (typeof password !== 'string' || password.length < 6) {
      return NextResponse.json({ error: 'La contraseña inicial (DNI) debe tener al menos 6 caracteres.' }, { status: 400 })
    }
    // Política solicitada: la primera contraseña es el DNI provisto
    const user = await crearUsuario(supabase, email, password, nombre, apellido)
    await actualizarPerfil(supabase, user.id, telefono || null, dni, fecha_nacimiento || null, nombre, apellido)

    // 2. Create Family Group
    const grupoId = await crearGrupoFamiliar(supabase, nombre_grupo, user.id, tipo_cuota_id)

    // 3. Create Titular as a member_familia record to allow inscriptions
    const { data: titularMiembro, error: titularMiembroError } = await supabase
      .from("miembros_familia")
      .insert({ 
        grupo_id: grupoId, 
        nombre, 
        apellido,
        dni, 
        parentesco: "Titular", 
        socio_id: user.id,
        fecha_nacimiento: fecha_nacimiento || null
      })
      .select('id').single()
      
    if (titularMiembroError || !titularMiembro) {
        throw new Error(`Error al crear el registro de miembro para el titular: ${titularMiembroError?.message}`)
    }

    // 4. Create inscriptions for the titular
    if (Array.isArray(titular_actividades)) {
        await crearInscripciones(supabase, titularMiembro.id, titular_actividades)
    }

    // 5. Create other family members and their inscriptions
    if (Array.isArray(miembros)) {
        await crearMiembrosConInscripciones(supabase, grupoId, miembros)
    }

    return NextResponse.json({
      success: true,
      user_id: user.id,
    })

  } catch (error: any) {
    console.error("[crear-socio] Error:", error)
    const message = error instanceof Error ? error.message : 'Error desconocido'
    const status = (error as any)?.status || 500
    // Normalizar mensaje para casos conocidos
    let normalized = message
    if (message === 'EMAIL_TAKEN') {
      normalized = 'El email ya se encuentra registrado'
    } else if (/password/i.test(message)) {
      normalized = 'La contraseña no cumple la política de seguridad. Verifica longitud mínima y complejidad.'
    }
    return NextResponse.json({ error: normalized }, { status })
  }
}
