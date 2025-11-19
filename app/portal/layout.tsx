import type React from "react"
import { requireAuth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { PortalSidebar } from "@/components/portal/portal-sidebar"
import { PortalHeader } from "@/components/portal/portal-header"
import localFont from "next/font/local"

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
    <div
      className={`${oswald.className} flex h-screen overflow-hidden bg-repeat bg-fixed`}
      style={{ backgroundImage: "url('/Nueva%20carpeta/Textura%20azul.png')" }}
    >
      <PortalSidebar profile={profile} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <PortalHeader profile={profile} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
