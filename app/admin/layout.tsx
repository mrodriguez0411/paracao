import type React from "react"
import { requireAuth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await requireAuth(["super_admin", "admin_disciplina"])

  if (!profile) {
    redirect("/auth/login")
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{
      backgroundImage: 'url(/Nueva%20carpeta/Patron%20azul.png)',
      backgroundSize: '300px',
      backgroundRepeat: 'repeat'
    }}>
      <div className="relative z-10 flex w-full h-full">
        <AdminSidebar profile={profile} />
        <div className="flex flex-1 flex-col overflow-hidden bg-white/80">
          <AdminHeader profile={profile} />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </div>
  )
}
