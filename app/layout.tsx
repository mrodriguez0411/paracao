import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "Club Deportivo - Gestión Deportiva",
  description: "Sistema de gestión para club deportivo con disciplinas, socios y cuotas",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className="antialiased bg-textura-azul bg-fixed">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
