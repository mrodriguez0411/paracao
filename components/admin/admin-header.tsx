'use client'

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { LogOut, User } from "lucide-react"
import type { Profile } from "@/lib/types"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface AdminHeaderProps {
  profile: Profile
}

export function AdminHeader({ profile }: AdminHeaderProps) {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut() // 1. Invalida la sesión en el servidor
    router.refresh()             // 2. Fuerza una recarga para limpiar el estado del cliente
  }

  return (
    <header className="flex h-20 items-center justify-between border-b border-yellow-300 bg-[#EFB600] px-6 shadow-md">
      <h1 className="text-xl font-bold text-[#1e3a8a]">
        {profile.rol === "super_admin" ? "PANEL DE ADMINISTRACIÓN" : "PANEL DE DISCIPLINA"}
      </h1>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2 bg-[#1e3a8a]/10 text-[#1e3a8a] hover:bg-[#1e3a8a]/20 hover:text-[#1e3a8a]">
            <User className="h-4 w-4" />
            <span className="font-medium">{profile.nombre_completo}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="border-yellow-300 bg-white">
          <DropdownMenuLabel className="text-[#1e3a8a]">Mi Cuenta</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-yellow-300" />
          <DropdownMenuItem 
            onClick={handleLogout}
            className="text-[#1e3a8a] focus:bg-[#1e3a8a]/10 focus:text-[#1e3a8a]"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Cerrar Sesión</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
