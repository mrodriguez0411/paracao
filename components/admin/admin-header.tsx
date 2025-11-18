"use client"

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
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <header className="flex h-20 items-center justify-between border-b border-yellow-200 bg-yellow-500 px-6 shadow-sm">
      <h1 className="text-xl font-bold text-gray-800">
        {profile.rol === "super_admin" ? "PANEL DE ADMINISTRACIÓN" : "PANEL DE DISCIPLINA"}
      </h1>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2 bg-yellow-400/20 text-gray-800 hover:bg-yellow-400/30 hover:text-gray-900">
            <User className="h-4 w-4" />
            <span className="font-medium">{profile.nombre_completo}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="border-amber-200 bg-white">
          <DropdownMenuLabel className="text-amber-800">Mi Cuenta</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-amber-200" />
          <DropdownMenuItem 
            onClick={handleLogout}
            className="text-amber-900 focus:bg-amber-100 focus:text-amber-900"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Cerrar Sesión</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
