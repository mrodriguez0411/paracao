'use client'

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


export type DisciplinaParaTabla = {
  id: string
  nombre: string
  descripcion: string
  cuota_deportiva: number
  estado: "activa" | "inactiva"
  administrador: string
}

export const columns: ColumnDef<DisciplinaParaTabla>[] = [
  {
    accessorKey: "nombre",
    header: "Disciplina",
  },
  {
    accessorKey: "descripcion",
    header: "Descripción",
  },
  {
    accessorKey: "cuota_deportiva",
    header: "Cuota Deportiva",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("cuota_deportiva"))
      const formatted = new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
      }).format(amount)

      return <div className="font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "administrador",
    header: "Administrador",
  },
  {
    accessorKey: "estado",
    header: "Estado",
    cell: ({ row }) => {
      const estado = row.getValue("estado")
      let variant: "outline" | "secondary" = "secondary"

      if (estado === "activa") {
        variant = "outline"
      }

      return <Badge variant={variant}>{estado}</Badge>
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const disciplina = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(disciplina.id)}
            >
              Copiar ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Ver disciplina</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
