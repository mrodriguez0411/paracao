"use server"

import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const supabase = await createClient()
  const { miembro_id, actividad_id } = await request.json()

  // 1. Validate data
  if (!miembro_id || !actividad_id) {
    return NextResponse.json(
      { message: "El ID del miembro y el ID de la actividad son requeridos" },
      { status: 400 }
    )
  }

  try {
    // 2. Check if the member is already inscribed in the activity
    const { data: existingInscripcion, error: existingError } = await supabase
      .from("inscripciones")
      .select("id")
      .eq("miembro_id", miembro_id)
      .eq("actividad_id", actividad_id)
      .maybeSingle()

    if (existingError) {
      console.error("Error al verificar inscripción existente:", existingError)
      throw new Error("Error al verificar la inscripción.")
    }

    if (existingInscripcion) {
      return NextResponse.json(
        { message: "El socio ya está inscrito en esta actividad." },
        { status: 409 }
      ) // 409 Conflict
    }

    // 3. Insert the new inscription
    const { data, error } = await supabase
      .from("inscripciones")
      .insert([
        {
          miembro_id,
          actividad_id,
        },
      ])
      .select()

    if (error) {
      console.error("Error al crear la inscripción:", error)
      throw new Error("No se pudo realizar la inscripción. Inténtalo de nuevo.")
    }

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    )
  }
}