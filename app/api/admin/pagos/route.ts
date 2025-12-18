import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

// Helper to create a Supabase service client
function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false } }
  );
}

// POST handler for updating fees to mark them as paid
export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient();

    // 1. Authorization Check
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'No autorizado: Token no proporcionado' }, { status: 401 });
    }
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 401 });
    }

    // 2. Parse Request Body
    const body = await request.json();
    const { fecha_pago, tipo_pago, cuotaIds } = body;

    // 3. Validate Input
    if (!fecha_pago || !tipo_pago || !cuotaIds || !Array.isArray(cuotaIds) || cuotaIds.length === 0) {
      return NextResponse.json({ error: "Faltan datos requeridos: se necesita fecha_pago, tipo_pago y una lista de cuotaIds." }, { status: 400 });
    }

    // 4. Call the RPC function to update the cuotas
    const { data: updatedCuotas, error: rpcError } = await supabase.rpc('registrar_pago_cuotas', {
      p_cuota_ids: cuotaIds,
      p_fecha_pago: fecha_pago,
      p_tipo_pago: tipo_pago
    });

    if (rpcError) {
      console.error("Error al ejecutar RPC para registrar el pago:", rpcError);
      return NextResponse.json({ error: "Error al actualizar las cuotas en la base de datos.", details: rpcError.message }, { status: 500 });
    }

    // 5. Return the updated fee records
    return NextResponse.json({ updatedCuotas }, { status: 200 });

  } catch (error) {
    const err = error as Error;
    console.error("Error inesperado en servidor (POST /pagos):", err);
    return NextResponse.json({ error: "Error interno del servidor.", details: err.message }, { status: 500 });
  }
}
