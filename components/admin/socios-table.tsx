"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, Pencil, Loader2, Users, Search, Plus } from "lucide-react"
import Link from "next/link"

export interface ProfileData {
  id: string;
  nombre_completo: string;
  email: string;
  dni: string;
  [key: string]: any;
}

export interface MiembroFamilia {
  id: string;
  nombre_completo: string;
  dni: string;
  parentesco: string;
  grupo_id: string;
  socio_id: string | null;
  fecha_nacimiento: string | null;
  created_at: string;
}

export interface GrupoWithData {
  id: string;
  nombre: string;
  cuota_social: number;
  created_at: string;
  titular_id: string;
  profiles: {
    id: string;
    nombre_completo: string;
    dni: string;
    email: string;
  } | null;
  miembros_familia: MiembroFamilia[];
  _error?: string;
  [key: string]: any;
}

interface SociosTableProps {
  grupos: GrupoWithData[];
  loading?: boolean;
}

export const SociosTable = ({ grupos, loading = false }: SociosTableProps) => {
  if (loading) {
    return (
      <Card className="p-8 text-center border border-gray-200 shadow-md rounded-xl">
        <div className="flex flex-col items-center justify-center space-y-3">
          <Loader2 className="h-10 w-10 animate-spin text-blue-800" />
          <p className="text-gray-600 font-medium">Cargando socios...</p>
        </div>
      </Card>
    )
  }

  if (grupos.length === 0) {
    return (
      <Card className="border border-gray-200 shadow-md rounded-xl overflow-hidden">
        <CardHeader className="bg-blue-800 px-6 py-4">
          <CardTitle className="text-white text-xl font-semibold">Socios</CardTitle>
        </CardHeader>
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Users className="h-16 w-16 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-700">No hay socios registrados</h3>
            <p className="text-gray-500 max-w-md">
              Comienza agregando un nuevo socio para verlo listado aquí.
            </p>
            <Button 
              asChild 
              className="bg-blue-800 hover:bg-blue-900 text-white font-semibold mt-4"
            >
              <Link href="/admin/socios/nuevo" className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                <span>Agregar Socio</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full font-['Oswald']">
      <Card className="border border-gray-100 shadow-sm rounded-xl overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white border-b border-gray-100">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[300px] text-gray-500 font-medium text-[11px] tracking-wider uppercase py-4 pl-6">Titular</TableHead>
                <TableHead className="text-gray-500 font-medium text-[11px] tracking-wider uppercase py-4">DNI</TableHead>
                <TableHead className="text-gray-500 font-medium text-[11px] tracking-wider uppercase py-4">Email</TableHead>
                <TableHead className="text-center text-gray-500 font-medium text-[11px] tracking-wider uppercase py-4">Miembros</TableHead>
                <TableHead className="text-gray-500 font-medium text-[11px] tracking-wider uppercase py-4">Cuota</TableHead>
                <TableHead className="w-[120px] text-right text-gray-500 font-medium text-[11px] tracking-wider uppercase py-4 pr-6">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100">
              {grupos.map((grupo) => {
                const nombreTitular = grupo.profiles?.nombre_completo || 'Sin nombre';
                const emailTitular = grupo.profiles?.email || 'Sin email';
                const dniTitular = grupo.profiles?.dni || 'Sin DNI';
                // Contar los miembros de la familia (excluyendo al titular)
                const cantidadMiembros = Array.isArray(grupo.miembros_familia) 
                  ? grupo.miembros_familia.length 
                  : 0;
                // Sumar 1 por el titular
                const totalMiembros = 1 + cantidadMiembros;

                return (
                  <TableRow 
                    key={grupo.id} 
                    className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0"
                  >
                    <TableCell className="py-4 pl-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-700 font-bold border-2 border-yellow-100">
                          {nombreTitular.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{nombreTitular}</div>
                          {grupo.nombre && (
                            <div className="text-xs text-gray-500 font-light mt-0.5">{grupo.nombre}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-700 font-light">
                      {dniTitular}
                    </TableCell>
                    <TableCell className="text-sm">
                      <a 
                        href={`mailto:${emailTitular}`} 
                        className="text-blue-600 hover:text-blue-800 hover:underline transition-colors font-light"
                      >
                        {emailTitular}
                      </a>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center">
                        <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-blue-50 text-blue-700 font-medium text-xs border border-blue-100">
                          {totalMiembros}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-medium text-gray-900">
                      <span className="px-2.5 py-1 rounded-full bg-gray-50 text-gray-800 text-sm font-medium">
                        ${grupo.cuota_social.toLocaleString('es-AR')}
                      </span>
                    </TableCell>
                    <TableCell className="pr-6">
                      <div className="flex justify-end gap-1.5">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-gray-500 hover:bg-blue-50 hover:text-blue-700 rounded-lg p-2 h-9 w-9 transition-all duration-200"
                          asChild
                        >
                          <Link href={`/admin/socios/${grupo.id}`} title="Ver detalles">
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-gray-500 hover:bg-blue-50 hover:text-blue-700 rounded-lg p-2 h-9 w-9 transition-all duration-200"
                          asChild
                        >
                          <Link href={`/admin/socios/${grupo.id}/editar`} title="Editar">
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
