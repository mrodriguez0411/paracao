import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      }
    }
  );
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const grupoId = pathParts.length > 4 ? pathParts[4] : null;

    // Logging para depuración
    console.log("Full request URL:", request.url);
    console.log("URL pathname:", url.pathname);
    console.log("Path parts:", pathParts);
    console.log("Extracted grupoId:", grupoId);

    if (!grupoId || grupoId === '[id]') {
      const debugInfo = `URL: ${request.url}, Path: ${url.pathname}, Parts: ${JSON.stringify(pathParts)}, Extracted ID: ${grupoId}`;
      return NextResponse.json({ error: `Se requiere el ID del grupo familiar. DEBUG: ${debugInfo}` }, { status: 400 });
    }

    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
        return NextResponse.json({ error: 'No autorizado: Token no proporcionado' }, { status: 401 });
    }
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
        return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 401 });
    }
    
    const { data: grupoData, error: grupoError } = await supabase
      .from('grupos_familiares')
      .select('titular_id')
      .eq('id', grupoId)
      .single();

    if (grupoError || !grupoData) {
      console.error("Error al buscar el grupo para obtener el titular:", grupoError);
      return NextResponse.json({ error: "No se pudo encontrar el grupo familiar para asociar el pago." }, { status: 404 });
    }

    const titularId = grupoData.titular_id;
    const body = await request.json();

    if (!body.monto || !body.fecha_pago) {
      return NextResponse.json({ error: "Faltan datos requeridos en el cuerpo del pago (monto, fecha_pago)" }, { status: 400 });
    }

    const payload = {
      socio_id: titularId, 
      grupo_id: grupoId,
      monto: parseFloat(body.monto),
      fecha_pago: body.fecha_pago,
      tipo_pago: body.tipo_pago || 'efectivo',
      referencia: body.referencia || null,
      mes_anio_cuota: body.mes_anio_cuota,
      notas: body.notas || null,
    };

    const { data: pago, error: insertError } = await supabase
      .from("pagos")
      .insert([payload])
      .select()
      .single();

    if (insertError) {
      console.error("Error al insertar el pago en la base de datos:", insertError);
      return NextResponse.json({ error: "Error al registrar el pago.", details: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ pago }, { status: 201 });

  } catch (error) {
    const err = error as Error;
    console.error("Error inesperado en servidor (POST /pagos):", err);
    return NextResponse.json({ error: "Error interno del servidor.", details: err.message }, { status: 500 });
  }
}
