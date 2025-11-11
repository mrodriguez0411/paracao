import type React from "react"
import { requireAuth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { PortalSidebar } from "@/components/portal/portal-sidebar"
import { PortalHeader } from "@/components/portal/portal-header"

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await requireAuth(["socio"])

  if (!profile) {
    redirect("/auth/login")
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <PortalSidebar profile={profile} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <PortalHeader profile={profile} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
