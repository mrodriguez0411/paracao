"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, Trophy, CreditCard, UserCog, Home } from "lucide-react"
import type { Profile } from "@/lib/types"

interface AdminSidebarProps {
  profile: Profile
}

export function AdminSidebar({ profile }: AdminSidebarProps) {
  const pathname = usePathname()

  const isSuperAdmin = profile.rol === "super_admin"
  const isAdminDisciplina = profile.rol === "admin_disciplina"

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, show: true },
    { href: "/admin/socios", label: "Socios", icon: Users, show: isSuperAdmin },
    { href: "/admin/disciplinas", label: "Disciplinas", icon: Trophy, show: isSuperAdmin },
    { href: "/admin/cuotas", label: "Cuotas", icon: CreditCard, show: isSuperAdmin },
    { href: "/admin/admins", label: "Administradores", icon: UserCog, show: isSuperAdmin },
    { href: "/admin/mi-disciplina", label: "Mi Disciplina", icon: Trophy, show: isAdminDisciplina },
    { href: "/admin/mis-cuotas", label: "Cuotas Disciplina", icon: CreditCard, show: isAdminDisciplina },
  ]

  return (
    <aside className="flex w-64 flex-col border-r bg-yellow-500 text-gray-800 shadow-lg">
      <div className="flex h-20 items-center justify-center border-b border-yellow-400 px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Trophy className="h-8 w-8 text-yellow-800" />
          <span className="text-gray-800">CLUB PARACAO</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems
          .filter((item) => item.show)
          .map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-yellow-400 text-gray-900 shadow-md"
                    : "text-gray-800 hover:bg-yellow-400/50 hover:text-gray-900",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
      </nav>
      <div className="mt-auto border-t border-yellow-400 p-4">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-800 hover:bg-yellow-400/50 hover:text-gray-900"
        >
          <Home className="h-4 w-4" />
          Ir al sitio web
        </Link>
      </div>
    </aside>
  )
}
