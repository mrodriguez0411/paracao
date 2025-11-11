import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import type { UserRole } from "./types"

export async function getCurrentUser() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return profile
}

export async function requireAuth(allowedRoles?: UserRole[]) {
  const profile = await getCurrentUser()

  if (!profile) {
    redirect("/auth/login")
  }

  if (allowedRoles && !allowedRoles.includes(profile.rol)) {
    redirect("/unauthorized")
  }

  return profile
}
