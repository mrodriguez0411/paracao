import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Helper to create a Supabase service client
function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false } }
  );
}

// GET request handler to fetch member and all their fees data
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const socioId = params.id;

    if (!socioId || socioId === '[id]') {
      return NextResponse.json({ error: 'Se requiere el ID del socio' }, { status: 400 });
    }

    const supabase = createServiceClient();

    // --- Authorization Check ---
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No autorizado: se requiere autenticación' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado: token inválido o expirado' }, { status: 401 });
    }
    // You might want to add role-based access control here as well

    // 1. Fetch Family Group data
    const { data: grupo, error: grupoError } = await supabase
      .from('grupos_familiares')
      .select(`
        id,
        nombre,
        titular:titular_id (
            nombre_completo,
            email,
            dni
        )
      `)
      .eq('id', socioId)
      .single();

    if (grupoError) throw new Error(`Error al obtener los datos del grupo familiar: ${grupoError.message}`);
    if (!grupo) return NextResponse.json({ error: 'No se encontró el grupo familiar' }, { status: 404 });

    // 2. Fetch ALL Fees (Cuotas), both paid and unpaid
    const { data: todasLasCuotas, error: cuotasError } = await supabase
      .from('cuotas')
      .select(`
        id,
        mes,
        anio,
        monto,
        tipo,
        pagada,
        fecha_pago,
        disciplina:disciplina_id ( nombre )
      `)
      .eq('grupo_id', socioId)
      .order('anio', { ascending: true })
      .order('mes', { ascending: true });

    if (cuotasError) {
      console.error('Supabase error fetching cuotas:', cuotasError);
      throw new Error(`Error al obtener las cuotas: ${cuotasError.message}`);
    }

    // 3. Process the fees to create a descriptive name for each
    const cuotasDetalladas = (todasLasCuotas || []).map(cuota => {
      let descripcion = '';
      if (cuota.tipo === 'social') {
        descripcion = 'Cuota Social';
      } else if (cuota.tipo === 'deportiva' && cuota.disciplina) {
        descripcion = `Cuota Deportiva - ${cuota.disciplina.nombre}`;
      } else {
        descripcion = 'Cuota (Otro)';
      }
      return {
        ...cuota,
        descripcion: `${descripcion} (${cuota.mes}/${cuota.anio})`
      };
    });
    
    // 4. Calculate the total amount of ONLY the pending fees
    const totalPendiente = cuotasDetalladas
      .filter(cuota => !cuota.pagada)
      .reduce((sum, cuota) => sum + (cuota.monto || 0), 0);

    // 5. Construct the final response
    const response = {
      grupo: {
        id: grupo.id,
        nombre: grupo.nombre || 'Sin nombre',
        titular: grupo.titular || { nombre_completo: 'N/A', email: 'N/A', dni: 'N/A' },
        total_general: totalPendiente // This correctly represents the total of what is actually pending
      },
      cuotas: cuotasDetalladas // Changed name to 'cuotas' to reflect it contains all fees
    };

    return NextResponse.json(response);

  } catch (error) {
    const err = error as Error;
    console.error('Error en GET /api/admin/socios/[id]/cuotas:', err.message);
    return NextResponse.json({ error: "Error interno del servidor", details: err.message }, { status: 500 });
  }
}
