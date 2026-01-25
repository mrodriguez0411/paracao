import { createServiceRoleClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

// --- Helper Functions (modularized for clarity) ---

async function crearUsuario(supabase: any, email: string, password: string, nombre: string, apellido: string) {
  console.log('[crearUsuario] Intentando crear usuario con:', { email, nombre, apellido })
  
  // Método 1: Intentar con admin.createUser (el original)
  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { nombre, apellido, rol: "socio" },
      email_confirm: true,
    })
    console.log('[crearUsuario] Resultado admin.createUser:', { 
      userId: data?.user?.id, 
      error: error?.message,
      errorDetails: error
    })
    
    if (!error && data.user) {
      console.log('[crearUsuario] Usuario creado con método admin:', data.user.id)
      return data.user
    }
    
    console.log('[crearUsuario] Método admin falló, intentando método signup...')
    
    // Método 2: Intentar con signUp (alternativa)
    const { data: data2, error: error2 } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nombre, apellido, rol: "socio" },
        emailRedirectTo: undefined
      }
    })
    
    console.log('[crearUsuario] Resultado signUp:', { 
      userId: data2.user?.id, 
      error: error2?.message,
      errorDetails: error2
    })
    
    if (error2 || !data2.user) {
      throw new Error(`Error al crear usuario (métodos admin y signup fallaron): admin=${error?.message}, signup=${error2?.message}`)
    }
    
    return data2.user
    
  } catch (error) {
    console.error('[crearUsuario] Error en ambos métodos:', error)
    throw new Error(`Error al crear usuario: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

async function actualizarPerfil(supabase: any, userId: string, telefono: string | null, dni: string, fecha_nacimiento: string | null) {
  const profileData: { dni: string, fecha_nacimiento: string | null, telefono: string | null } = {
    dni,
    fecha_nacimiento: fecha_nacimiento,
    telefono: telefono,
  };

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
    nombre_completo: `${m.nombre.trim()} ${m.apellido.trim()}`,
    dni: m.dni,
    parentesco: m.parentesco || null,
    fecha_nacimiento: m.fecha_nacimiento,
  }))

  const { data: miembrosInsertados, error: miembrosError } = await supabase.from("miembros_familia").insert(miembrosParaInsertar).select("id, nombre_completo")
  if (miembrosError) throw new Error(`Error al crear miembros: ${miembrosError.message}`)

  // Now, handle their inscriptions (actividades)
  const inscripcionesParaCrear = miembros.flatMap((miembroOriginal, index) => {
    const miembroInsertado = miembrosInsertados[index]
    if (!miembroInsertado || !Array.isArray(miembroOriginal.actividades)) return []
    
    return miembroOriginal.actividades.map((actividadId: string) => ({
      miembro_id: miembroInsertado.id,
      actividad_id: actividadId,
    }))
  })

  if (inscripcionesParaCrear.length > 0) {
    const { error: inscError } = await supabase.from("inscripciones").insert(inscripcionesParaCrear)
    if (inscError) console.warn(`[crear-socio] No se pudieron crear algunas inscripciones de miembros:`, inscError.message)
  }
  
  return miembrosInsertados
}

async function crearInscripciones(supabase: any, miembroId: string, actividadIds: string[]) {
  if (!miembroId || !actividadIds || actividadIds.length === 0) return

  const payload = actividadIds.map(actividadId => ({ 
    miembro_id: miembroId, 
    actividad_id: actividadId,
  }))

  const { error } = await supabase.from("inscripciones").insert(payload)
  if (error) console.warn(`[crear-socio] No se pudieron crear inscripciones para el miembro ${miembroId}:`, error.message)
}

// --- Main POST Handler ---

export async function POST(request: NextRequest) {
  console.log('[crear-socio] === INICIO PETICIÓN ===')
  
  try {
    const body = await request.json()
    console.log('[crear-socio] Datos recibidos:', { 
      email: body.email, 
      nombre: body.nombre, 
      apellido: body.apellido,
      passwordLength: body.password?.length,
      hasRequiredFields: !!(body.email && body.password && body.nombre && body.apellido && body.dni && body.nombre_grupo && body.tipo_cuota_id)
    })
    
    const {
      email, password, nombre, apellido, dni, telefono, 
      nombre_grupo, tipo_cuota_id, fecha_nacimiento, 
      miembros, 
      titular_actividades, 
    } = body

    if (!email || !password || !nombre || !apellido || !dni || !nombre_grupo || !tipo_cuota_id) {
      console.log('[crear-socio] Campos faltantes:', { email: !!email, password: !!password, nombre: !!nombre, apellido: !!apellido, dni: !!dni, nombre_grupo: !!nombre_grupo, tipo_cuota_id: !!tipo_cuota_id })
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    const nombre_completo = `${nombre.trim()} ${apellido.trim()}`;

    const supabase = createServiceRoleClient()
    
    // Verificar configuración del cliente
    console.log('[crear-socio] Configuración Supabase:', {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Presente' : 'Faltante',
      serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Presente' : 'Faltante',
      serviceKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length
    })

    // 1. Create Auth User & Profile
    const user = await crearUsuario(supabase, email, password, nombre, apellido)
    await actualizarPerfil(supabase, user.id, telefono || null, dni, fecha_nacimiento || null)

    // 2. Create Family Group
    const grupoId = await crearGrupoFamiliar(supabase, nombre_grupo, user.id, tipo_cuota_id)

    // 3. Create Titular as a member_familia record to allow inscriptions
    const { data: titularMiembro, error: titularMiembroError } = await supabase
      .from("miembros_familia")
      .insert({ 
        grupo_id: grupoId, 
        nombre_completo, 
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
    console.error("[crear-socio] Error general:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
