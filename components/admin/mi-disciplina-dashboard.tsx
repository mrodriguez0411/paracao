
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// Usaremos íconos para que el dashboard sea más visual
import { Users, UserCheck, UserX } from "lucide-react"

interface DashboardProps {
  totalInscriptos: number
  totalAbonados: number
  totalPendientes: number
}

export function MiDisciplinaDashboard({
  totalInscriptos,
  totalAbonados,
  totalPendientes,
}: DashboardProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Inscriptos</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalInscriptos}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Abonados (Mes Actual)</CardTitle>
          <UserCheck className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{totalAbonados}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pendientes (Mes Actual)</CardTitle>
          <UserX className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">{totalPendientes}</div>
        </CardContent>
      </Card>
    </div>
  )
}
