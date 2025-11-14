import { NextResponse } from "next/server"
import { createClient, createServiceRoleClient } from "@/lib/supabase/server"

export async function GET(req: Request) {
  try {
    // request-bound client (respects cookies & RLS)
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    // Use service-role client to read profiles for debugging. This bypasses RLS
    // which prevents the infinite recursion error while we investigate policies.
    let profile = null
    let profileError = null
    try {
      const service = createServiceRoleClient()
      const res = await service.from('profiles').select('*').eq('id', user?.id).single()
      profile = res.data
      profileError = res.error
    } catch (e) {
      profileError = String(e)
    }

    return NextResponse.json({ user, profile, userError, profileError })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
