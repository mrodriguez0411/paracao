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
      },
      global: {
        headers: {
          'Cache-Control': 'no-store'
        }
      },
      db: {
        schema: 'public'
      }
    }
  );
}

// Obtener los pagos de un socio
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServiceClient();
    const url = new URL(request.url);
    const socioId = url.pathname.split("/")[4];

    if (!socioId) {
      return NextResponse.json(
        { error: "Se requiere el ID del socio" },
        { status: 400 }
      );
    }

    // Obtener los pagos del grupo familiar
    const { data: pagos, error } = await supabase
      .from('pagos')
      .select('*')
      .eq('grupo_id', socioId)
      .order('fecha_pago', { ascending: false });

    if (error) {
      console.error('Error al obtener los pagos:', error);
      return NextResponse.json(
        { error: "Error al obtener los pagos del socio" },
        { status: 500 }
      );
    }

    return NextResponse.json(pagos || []);

  } catch (error) {
    console.error('Error en GET /api/admin/socios/[id]/pagos:', error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// Crear un nuevo pago
export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    const body = await request.json();

    // Validar datos del pago
    if (!body.grupo_id) {
      return NextResponse.json(
        { error: "Se requiere el ID del grupo familiar" },
        { status: 400 }
      );
    }

    if (!body.monto || isNaN(parseFloat(body.monto))) {
      return NextResponse.json(
        { error: "El monto es requerido y debe ser un número válido" },
        { status: 400 }
      );
    }

    // Crear el pago en la base de datos
    const { data: pago, error } = await supabase
      .from('pagos')
      .insert([
        {
          grupo_id: body.grupo_id,
          monto: parseFloat(body.monto),
          fecha_pago: body.fecha_pago || new Date().toISOString().split('T')[0],
          tipo_pago: body.tipo_pago || 'efectivo',
          referencia: body.referencia || null,
          mes_anio_cuota: body.mes_anio_cuota || new Date().toISOString().slice(0, 7) + '-01',
          notas: body.notas || null,
        }
      ])
      .select();

    if (error) {
      console.error("Error al crear el pago:", error);
      return NextResponse.json(
        { error: "Error al registrar el pago" },
        { status: 500 }
      );
    }

    return NextResponse.json({ pago: pago?.[0] }, { status: 201 });

  } catch (error) {
    console.error("Error en el servidor:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
