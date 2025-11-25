import { createServiceRoleClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// Obtener los pagos de un socio
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServiceRoleClient();
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
      .from("pagos")
      .select("*")
      .eq("grupo_id", socioId)
      .order("fecha_pago", { ascending: false });

    if (error) {
      console.error("Error al obtener los pagos:", error);
      return NextResponse.json(
        { error: "Error al obtener los pagos del socio" },
        { status: 500 }
      );
    }

    // Calcular total pagado
    const totalPagado = pagos.reduce((sum, pago) => sum + (pago.monto || 0), 0);

    // Obtener el último pago
    const ultimoPago =
      pagos.length > 0
        ? {
            fecha: pagos[0].fecha_pago,
            monto: pagos[0].monto,
            mes_cuota: pagos[0].mes_anio_cuota,
          }
        : null;

    // Actualizar el resumen en la ruta de cuotas
    const { error: updateError } = await supabase
      .from("grupos_familiares")
      .update({
        ultimo_pago: ultimoPago?.fecha || null,
        total_pagado: totalPagado,
        ultima_actualizacion: new Date().toISOString(),
      })
      .eq("id", socioId);

    if (updateError) {
      console.error("Error al actualizar el resumen de pagos:", updateError);
    }

    return NextResponse.json(pagos || []);
  } catch (error) {
    console.error("Error en GET /api/admin/socios/[id]/pagos:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// Crear un nuevo pago
export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceRoleClient();
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
      .from("pagos")
      .insert([
        {
          grupo_id: body.grupo_id,
          monto: parseFloat(body.monto),
          fecha_pago: body.fecha_pago || new Date().toISOString().split("T")[0],
          tipo_pago: body.tipo_pago || "efectivo",
          referencia: body.referencia || null,
          mes_anio_cuota:
            body.mes_anio_cuota ||
            new Date().toISOString().slice(0, 7) + "-01",
          notas: body.notas || null,
        },
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
