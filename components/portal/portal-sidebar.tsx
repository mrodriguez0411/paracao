"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, Users, CreditCard, Trophy, LayoutDashboard } from "lucide-react"
import type { Profile } from "@/lib/types"

interface PortalSidebarProps {
  profile: Profile
}

export function PortalSidebar({ profile }: PortalSidebarProps) {
  const pathname = usePathname()

  const navItems = [
    { href: "/portal", label: "Dashboard", icon: LayoutDashboard },
    { href: "/portal/familia", label: "Mi Familia", icon: Users },
    { href: "/portal/disciplinas", label: "Disciplinas", icon: Trophy },
    { href: "/portal/cuotas", label: "Mis Cuotas", icon: CreditCard },
  ]

  return (
    <aside className="flex w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Trophy className="h-6 w-6 text-primary" />
          <span>Club Deportivo</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="border-t p-4">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <Home className="h-4 w-4" />
          Ir al sitio web
        </Link>
      </div>
    </aside>
  )
}
