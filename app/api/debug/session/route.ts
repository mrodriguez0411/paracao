import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  try {
    const profile = await getCurrentUser()
    if (!profile) {
      return NextResponse.json({ profile: null }, { status: 200 })
    }
    return NextResponse.json({ profile }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 }
    )
  }
}
