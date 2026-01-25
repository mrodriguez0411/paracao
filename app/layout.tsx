import React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { MessageCircle } from "lucide-react"
import { FaWhatsapp } from "react-icons/fa"

export const metadata: Metadata = {
  title: "Club Paracao - Gestión Deportiva",
  description: "Sistema de gestión para Club Paracao con disciplinas, socios y cuotas",
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
        
        {/* WhatsApp Floating Button */}
        <a 
          href="https://wa.me/5491234567890" 
          target="_blank" 
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full shadow-xl transition-all duration-300 hover:scale-110 hover:shadow-2xl group"
          aria-label="Contactar por WhatsApp"
        >
          <FaWhatsapp className="w-7 h-7 group-hover:scale-110 transition-transform duration-300" />
        </a>
      </body>
    </html>
  )
}
