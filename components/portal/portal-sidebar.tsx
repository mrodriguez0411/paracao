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
    <aside className="flex w-64 flex-col border-r border-yellow-300 bg-[#EFB600] text-[#1e3a8a] shadow-lg">
      <div className="flex h-20 items-center justify-center border-b border-yellow-300 px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Trophy className="h-8 w-8 text-[#1e3a8a]" />
          <span className="text-[#1e3a8a]">CLUB PARACAO</span>
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
                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[#1e3a8a]/10 text-[#1e3a8a] shadow-md"
                  : "text-[#1e3a8a] hover:bg-[#1e3a8a]/10 hover:text-[#1e3a8a]",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="mt-auto border-t border-yellow-300 p-4">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-[#1e3a8a] hover:bg-[#1e3a8a]/10 hover:text-[#1e3a8a]"
        >
          <Home className="h-4 w-4" />
          Ir al sitio web
        </Link>
      </div>
    </aside>
  )
}
