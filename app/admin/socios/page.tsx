'use client'

import { useEffect, useState } from 'react'
import { requireAuth } from "@/lib/auth"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus } from "lucide-react"
import Link from "next/link"
import { SociosTable, type GrupoWithData } from "@/components/admin/socios-table"

export default function SociosPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [grupos, setGrupos] = useState<GrupoWithData[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadSocios()
  }, [])

  const loadSocios = async (search = '') => {
    try {
      setLoading(true);
      console.log('Cargando datos de socios...');
      
      // 1. Primero verificamos si hay grupos familiares
      console.log('Verificando grupos familiares...');
      const { count: totalGrupos, error: countError } = await supabase
        .from('grupos_familiares')
        .select('*', { count: 'exact', head: true });
      
      console.log(`Total de grupos familiares en la base de datos: ${totalGrupos}`);
      
      if (countError) {
        console.error('Error al contar grupos familiares:', countError);
        throw countError;
      }
      
      if (totalGrupos === 0) {
        console.log('No hay grupos familiares en la base de datos');
        setGrupos([]);
        setLoading(false);
        return;
      }
      
      // 2. Ahora obtenemos los grupos con los perfiles
      console.log('Obteniendo grupos familiares...');
      const { data: grupos, error: gruposError } = await supabase
        .from('grupos_familiares')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (gruposError) {
        console.error('Error al cargar grupos:', gruposError);
        throw gruposError;
      }
      
      console.log('Grupos encontrados:', grupos);
      
      // 3. Verificamos si hay perfiles en la base de datos
      console.log('Verificando perfiles en la base de datos...');
      const { data: todosLosPerfiles, error: perfilesError } = await supabase
        .from('profiles')
        .select('*')
        .limit(5);
      
      if (perfilesError) {
        console.error('Error al verificar perfiles:', perfilesError);
      } else {
        console.log('Perfiles en la base de datos (primeros 5):', todosLosPerfiles);
        
        // Si no hay perfiles, creamos uno temporal para el titular
        if (!todosLosPerfiles || todosLosPerfiles.length === 0) {
          console.log('No hay perfiles en la base de datos. Creando perfil temporal...');
          const perfilTemporal = {
            id: '9cd74258-1528-45d8-88dd-8e011e93db0d',
            nombre_completo: 'Titular Temporal',
            email: 'titular@ejemplo.com',
            dni: '12345678',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          // Intentamos insertar el perfil temporal
          const { error: insertError } = await supabase
            .from('profiles')
            .insert([perfilTemporal]);
            
          if (insertError) {
            console.error('Error al crear perfil temporal:', insertError);
          } else {
            console.log('Perfil temporal creado exitosamente');
            // Actualizamos la lista de perfiles
            todosLosPerfiles.push(perfilTemporal);
          }
        }
      }
      
      // 4. Obtenemos los perfiles de los titulares
      const titularesIds = grupos.map(g => g.titular_id).filter(Boolean);
      console.log('Buscando perfiles para IDs:', titularesIds);
      
      let perfiles = [];
      if (titularesIds.length > 0) {
        const { data: perfilesData, error: perfilesTitularesError } = await supabase
          .from('profiles')
          .select('*')
          .in('id', titularesIds);
          
        if (perfilesTitularesError) {
          console.error('Error al cargar perfiles de titulares:', perfilesTitularesError);
        } else {
          perfiles = perfilesData || [];
          console.log('Perfiles de titulares encontrados:', perfiles);
          
          // Verificamos si el perfil del titular existe
          const perfilTitular = perfiles.find(p => p.id === titularesIds[0]);
          console.log('Perfil del titular encontrado:', perfilTitular);
          
          if (!perfilTitular) {
            console.error('No se encontró el perfil del titular. ID:', titularesIds[0]);
            // Mostramos los primeros 5 perfiles para verificar los IDs
            const { data: primerosPerfiles } = await supabase
              .from('profiles')
              .select('id, nombre_completo, email')
              .limit(5);
            console.log('Primeros perfiles en la base de datos:', primerosPerfiles);
          }
        }
      }
      
      // Combinamos los datos
      const gruposConTitular = grupos.map(grupo => {
        const perfilTitular = perfiles.find(p => p.id === grupo.titular_id) || null;
        return {
          ...grupo,
          profiles: perfilTitular
        };
      });
      
      if (gruposError) {
        console.error('Error al cargar grupos familiares con perfiles:', gruposError);
        // Intentamos cargar solo los grupos sin el perfil
        console.log('Intentando cargar solo los grupos...');
        const { data: gruposSolos, error: gruposSolosError } = await supabase
          .from('grupos_familiares')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (gruposSolosError) {
          console.error('Error al cargar solo los grupos:', gruposSolosError);
          throw gruposSolosError;
        }
        
        console.log('Grupos sin perfiles:', gruposSolos);
        setGrupos(gruposSolos);
        setLoading(false);
        return;
      }
      
      console.log('Grupos con datos del titular:', gruposConTitular);
      
      // 2. Obtenemos los IDs de los grupos para buscar los miembros
      const gruposIds = gruposConTitular.map(g => g.id);
      
      // 3. Obtenemos los miembros de la familia
      const { data: miembros, error: miembrosError } = await supabase
        .from('miembros_familia')
        .select('*')
        .in('grupo_id', gruposIds);
      
      if (miembrosError) {
        console.error('Error al cargar miembros:', miembrosError);
        throw miembrosError;
      }
      
      // 4. Procesamos los datos para el frontend
      const gruposProcesados = gruposConTitular.map(grupo => {
        // El perfil del titular ya viene en grupo.profiles
        const perfilTitular = grupo.profiles;
        
        // Filtramos los miembros de este grupo
        const miembrosGrupo = miembros?.filter(m => m.grupo_id === grupo.id) || [];
        
        return {
          ...grupo,
          profiles: perfilTitular,
          miembros_familia: miembrosGrupo,
          totalMiembros: 1 + miembrosGrupo.length // 1 por el titular + miembros
        };
      });
      
      console.log('Grupos procesados:', gruposProcesados);
      
      // 5. Aplicamos el filtro de búsqueda si existe
      let datosFiltrados = [...gruposProcesados];
      if (search) {
        const searchLower = search.toLowerCase();
        datosFiltrados = gruposProcesados.filter(grupo => {
          const nombreTitular = grupo.profiles?.nombre_completo?.toLowerCase() || '';
          const emailTitular = grupo.profiles?.email?.toLowerCase() || '';
          const dniTitular = grupo.profiles?.dni?.toLowerCase() || '';
          const nombreGrupo = grupo.nombre?.toLowerCase() || '';
          
          return (
            nombreTitular.includes(searchLower) ||
            emailTitular.includes(searchLower) ||
            dniTitular.includes(searchLower) ||
            nombreGrupo.includes(searchLower)
          );
        });
      }
      
      setGrupos(datosFiltrados);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar los datos de socios:', error);
      setLoading(false);
      // Mostrar un mensaje de error al usuario
      alert('Ocurrió un error al cargar los datos de socios. Por favor, intente nuevamente.');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    loadSocios(searchTerm)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Socios</h2>
          <p className="text-muted-foreground">Gestiona los grupos familiares y sus miembros</p>
        </div>
        <Button asChild>
          <Link href="/admin/socios/nuevo">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Socio
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por nombre o DNI..."
              className="w-full pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={loading}>
            <Search className="mr-2 h-4 w-4" />
            Buscar
          </Button>
        </form>
      </div>

      <SociosTable grupos={grupos} loading={loading} />
    </div>
  )
}
