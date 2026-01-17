'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, Pencil, Loader2, Users, Plus, CreditCard, ToggleLeft, ToggleRight } from "lucide-react"
import Link from "next/link"
import { useState, useTransition, useMemo, useEffect } from "react"

// Interfaces
export interface ProfileData {
  id: string;
  nombre_completo: string;
  email: string;
  dni: string;
  edad?: number;
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
  edad?: number;
  created_at: string;
}

export interface GrupoWithData {
  id: string;
  nombre: string;
  cuota_social: number;
  tipo_cuota_id: string | null;
  activo: boolean;
  cuotas_tipos: {
    id: string;
    nombre: string;
    monto: number;
    tipo: string;
    activo: boolean;
  } | null;
  created_at: string;
  titular_id: string;
  profiles: {
    id: string;
    nombre_completo: string;
    dni: string;
    email: string;
    edad?: number;
  } | null;
  miembros_familia: MiembroFamilia[];
  totalMiembros?: number;
  _error?: string;
  [key: string]: any;
}

interface SociosTableProps {
  grupos: GrupoWithData[];
  loading?: boolean;
}

export const SociosTable = ({ grupos: initialGrupos, loading = false }: SociosTableProps) => {
  const [grupos, setGrupos] = useState(initialGrupos);
  const [filter, setFilter] = useState('activos');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setGrupos(initialGrupos);
  }, [initialGrupos]);

  const handleToggleActive = async (grupo: GrupoWithData) => {
    const newActivoState = !grupo.activo;
    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/socios/${grupo.id}/toggle-active`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ activo: newActivoState }),
        });
        if (!response.ok) throw new Error('No se pudo actualizar el estado');
        const updatedGrupo = await response.json();
        setGrupos((prev) =>
          prev.map((g) => (g.id === updatedGrupo.id ? { ...g, activo: updatedGrupo.activo } : g))
        );
      } catch (error) {
        console.error(error);
      }
    });
  };

  const filteredGrupos = useMemo(() => {
    if (filter === 'activos') return grupos.filter((g) => g.activo !== false);
    if (filter === 'inactivos') return grupos.filter((g) => g.activo === false);
    return grupos;
  }, [grupos, filter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-10 w-10 animate-spin text-blue-800" />
      </div>
    );
  }

  const FilterButtons = () => (
    <div className="mb-4 flex items-center gap-2 rounded-lg bg-white p-1.5 shadow-sm border border-gray-100 w-fit">
      <Button onClick={() => setFilter('activos')} variant={filter === 'activos' ? "secondary" : "ghost"} size="sm" className='rounded-md'>Activos</Button>
      <Button onClick={() => setFilter('inactivos')} variant={filter === 'inactivos' ? "secondary" : "ghost"} size="sm" className='rounded-md'>Inactivos</Button>
      <Button onClick={() => setFilter('todos')} variant={filter === 'todos' ? "secondary" : "ghost"} size="sm" className='rounded-md'>Todos</Button>
    </div>
  );
  
  const TableHeader = () => (
    <div className="flex items-center px-4 py-2 rounded-lg bg-white text-gray-500 font-medium text-xs uppercase tracking-wider mb-3 shadow-sm border border-gray-100">
      <div className="w-[25%]">Titular</div>
      <div className="w-[15%]">DNI</div>
      <div className="w-[10%] text-center">Edad</div>
      <div className="w-[15%]">Email</div>
      <div className="w-[10%] text-center">Miembros</div>
      <div className="w-[15%] text-center">Cuota</div>
      <div className="w-[10%] text-right">Acciones</div>
    </div>
  );

  if (initialGrupos.length === 0) {
    return (
      <Card className="border border-gray-200 shadow-md rounded-xl overflow-hidden bg-textura-amarilla mt-6">
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Users className="h-16 w-16 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-700">No hay socios registrados</h3>
            <p className="text-gray-500 max-w-md">Comienza agregando un nuevo socio para verlo listado aquí.</p>
            <Button asChild className="bg-blue-800 hover:bg-blue-900 text-white font-semibold mt-4">
              <Link href="/admin/socios/nuevo" className="flex items-center gap-2"><Plus className="h-5 w-5" /><span>Agregar Socio</span></Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full font-['Oswald']">
      <FilterButtons />
      <TableHeader />
      <div className="space-y-3">
        {filteredGrupos.length > 0 ? (
          filteredGrupos.map((grupo) => {
            const nombreTitular = grupo.profiles?.nombre_completo || 'Sin nombre';
            const emailTitular = grupo.profiles?.email || 'Sin email';
            const dniTitular = grupo.profiles?.dni || 'Sin DNI';
            const edadTitular = grupo.profiles?.edad ?? 'N/A';
            const totalMiembros = 1 + (Array.isArray(grupo.miembros_familia) ? grupo.miembros_familia.length : 0);
            const isActive = grupo.activo !== false;

            return (
              <div key={grupo.id} className={`flex items-center p-4 rounded-lg bg-white shadow-sm border border-gray-100 transition-all duration-300 ${!isActive ? 'opacity-50' : ''}`}>
                {/* Titular */}
                <div className="w-[25%] flex items-center">
                  <div className={`h-2.5 w-2.5 rounded-full mr-3 ${isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-700 font-bold border-2 border-yellow-100">
                    {nombreTitular.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{nombreTitular}</div>
                    <div className="text-xs text-gray-500 font-light mt-0.5">{grupo.nombre || 'Sin nombre de grupo'}</div>
                  </div>
                </div>
                {/* DNI */}
                <div className="w-[15%] text-sm text-gray-700 font-light">{dniTitular}</div>
                 {/* Edad */}
                <div className="w-[10%] text-center text-sm text-gray-700 font-light">{edadTitular}</div>
                {/* Email */}
                <div className="w-[15%] text-sm">
                  <a href={`mailto:${emailTitular}`} className="text-blue-600 hover:text-blue-800 hover:underline transition-colors font-light">{emailTitular}</a>
                </div>
                {/* Miembros */}
                <div className="w-[10%] text-center">
                  <div className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-800 font-medium text-sm border border-blue-200">{totalMiembros}</div>
                </div>
                {/* Cuota */}
                <div className="w-[15%] flex flex-col items-center">
                    <div className="h-16 w-16 bg-gray-50 rounded-full flex flex-col items-center justify-center border text-center">
                        <span className='text-[10px] uppercase font-semibold text-gray-500 leading-tight'>{grupo.cuotas_tipos?.nombre.replace(" ", "\n") || 'Sin tipo'}</span>
                    </div>
                    <span className="text-xs text-gray-500 mt-1">${(grupo.cuotas_tipos?.monto || 0).toLocaleString('es-AR')}</span>
                </div>
                {/* Acciones */}
                <div className="w-[10%] flex justify-end gap-1">
                   <Button variant="ghost" size="sm" className="text-gray-500 hover:bg-green-50 hover:text-green-700 rounded-lg p-2 h-9 w-9" asChild>
                    <Link href={`/admin/historial-cuotas?grupo_id=${grupo.id}`} title="Abonar Cuota"><CreditCard className="h-4 w-4" /></Link>
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:bg-blue-50 hover:text-blue-700 rounded-lg p-2 h-9 w-9" asChild>
                    <Link href={`/admin/socios/${grupo.id}`} title="Ver detalles"><Eye className="h-4 w-4" /></Link>
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:bg-blue-50 hover:text-blue-700 rounded-lg p-2 h-9 w-9" asChild>
                    <Link href={`/admin/socios/${grupo.id}/editar`} title="Editar"><Pencil className="h-4 w-4" /></Link>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleToggleActive(grupo)} disabled={isPending} title={isActive ? 'Desactivar' : 'Activar'}
                    className={`rounded-lg p-2 h-9 w-9 ${isActive ? 'text-gray-500 hover:bg-red-50 hover:text-red-700' : 'text-gray-500 hover:bg-green-50 hover:text-green-700'}`}>
                    {isActive ? <ToggleLeft className="h-4 w-4" /> : <ToggleRight className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )
          })
        ) : (
          <Card className="p-8 text-center border border-dashed border-gray-200 shadow-none rounded-xl">
            <div className="flex flex-col items-center justify-center space-y-3">
              <Users className="h-10 w-10 text-gray-400" />
              <p className="text-gray-600 font-medium">No se encontraron socios con el filtro actual.</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}