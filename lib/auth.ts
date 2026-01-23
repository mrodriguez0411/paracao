import { createClient, createServiceRoleClient } from "@/lib/supabase/server"
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

  // Use service-role client to avoid RLS recursion when reading profiles
  // The fallback to the standard client was removed as it's the likely cause of the 500 error
  // due to a recursive RLS policy.
  const service = createServiceRoleClient()
  const { data: profile } = await service.from("profiles").select("*").eq("id", user.id).single()
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
