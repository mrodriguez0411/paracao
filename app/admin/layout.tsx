
export const dynamic = 'force-dynamic';

import type React from "react"
import { requireAuth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"
import localFont from "next/font/local"
import { headers } from "next/headers"

const oswald = localFont({
  src: [
    { path: "../../public/Nueva carpeta/Oswald-ExtraLight.ttf", weight: "200", style: "normal" },
    { path: "../../public/Nueva carpeta/Oswald-Light.ttf", weight: "300", style: "normal" },
    { path: "../../public/Nueva carpeta/Oswald-Regular.ttf", weight: "400", style: "normal" },
    { path: "../../public/Nueva carpeta/Oswald-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../../public/Nueva carpeta/Oswald-Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-oswald",
  display: "swap",
})

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await requireAuth(["super_admin", "admin_disciplina"])
  if (!profile) {
    redirect("/auth/login")
  }

  const heads = headers()
  const pathname = heads.get("next-url")

  if (profile.rol === "admin_disciplina" && pathname === "/admin") {
    redirect("/admin/mi-disciplina")
  }

  return (
    <div
      className={`${oswald.className} flex h-screen overflow-hidden bg-repeat bg-fixed`}
      style={{ backgroundImage: "url('/Nueva%20carpeta/Textura%20azul.png')" }}
    >
      <div className="relative z-10 flex w-full h-full">
        <AdminSidebar profile={profile} />
        {/* 
          La siguiente `key` es la solución al problema de caché entre usuarios.
          Al usar el ID del perfil como clave, React se ve forzado a recrear este 
          componente y sus hijos (`AdminHeader`, `main`, `children`) desde cero
          cada vez que el usuario cambia. Esto previene que un admin de disciplina
          sea redirigido a una página de super_admin que vio en una sesión anterior.
        */}
        <div key={profile.id} className="flex flex-1 flex-col overflow-hidden">
          <AdminHeader profile={profile} />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </div>
  )
}
