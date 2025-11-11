import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Calendar, Award as IdCard } from "lucide-react"

interface MiembroWithInscripciones {
  id: string
  nombre_completo: string
  dni: string | null
  fecha_nacimiento: string | null
  parentesco: string | null
  inscripciones: Array<{
    id: string
    activa: boolean
    disciplinas: {
      nombre: string
      cuota_deportiva: number
    }
  }>
}

interface MiembroCardProps {
  miembro: MiembroWithInscripciones
}

export function MiembroCard({ miembro }: MiembroCardProps) {
  const inscripcionesActivas = miembro.inscripciones?.filter((i) => i.activa) || []

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          {miembro.nombre_completo}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          {miembro.parentesco && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Parentesco:</span>
              <span className="font-medium">{miembro.parentesco}</span>
            </div>
          )}
          {miembro.dni && (
            <div className="flex items-center gap-2 text-sm">
              <IdCard className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">DNI:</span>
              <span className="font-medium">{miembro.dni}</span>
            </div>
          )}
          {miembro.fecha_nacimiento && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Fecha de Nacimiento:</span>
              <span className="font-medium">{new Date(miembro.fecha_nacimiento).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        <div>
          <p className="text-sm font-medium mb-2">Disciplinas:</p>
          {inscripcionesActivas.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {inscripcionesActivas.map((inscripcion) => (
                <Badge key={inscripcion.id} variant="secondary">
                  {inscripcion.disciplinas.nombre}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Sin disciplinas asignadas</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
