
-- =================================================================
-- SCRIPT DEFINITIVO BASADO EN EL ESQUEMA REAL DE LA BASE DE DATOS
-- =================================================================
-- INSTRUCCIONES:
-- 1. Ejecuta este script completo en tu editor SQL de Supabase.
--    Reemplazará la función con la versión final y correcta.
-- =================================================================

-- PASO 1: Eliminar la función y el tipo antiguos para una instalación limpia.
DROP FUNCTION IF EXISTS public.get_miembros_por_disciplina(uuid);
DROP TYPE IF EXISTS public.miembro_disciplina CASCADE;

-- PASO 2: Recrear el tipo de dato que la función devolverá.
CREATE TYPE public.miembro_disciplina AS (
  id UUID,
  nombre_completo TEXT,
  email TEXT,
  telefono TEXT,
  dni TEXT,
  created_at TIMESTAMPTZ
);

-- PASO 3: Crear la función con la unión (JOIN) correcta, basada en el archivo 001_create_tables.sql.
CREATE OR REPLACE FUNCTION public.get_miembros_por_disciplina(admin_id_param uuid)
RETURNS SETOF public.miembro_disciplina
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY 
  SELECT 
    mf.id,                -- ID del miembro (de miembros_familia)
    mf.nombre_completo,     -- Nombre del miembro (de miembros_familia)
    p.email,                -- Email del perfil asociado (de profiles)
    p.telefono,             -- Teléfono del perfil asociado (de profiles)
    mf.dni,                 -- DNI del miembro (de miembros_familia)
    mf.created_at           -- Fecha de creación del miembro (de miembros_familia)
  FROM 
    public.miembros_familia mf
  JOIN 
    public.inscripciones i ON mf.id = i.miembro_id
  JOIN 
    public.disciplinas d ON i.disciplina_id = d.id
  -- LA UNIÓN CORRECTA Y DEFINITIVA:
  -- Conecta miembros_familia con profiles usando la columna `socio_id`.
  JOIN 
    public.profiles p ON mf.socio_id = p.id
  WHERE 
    d.admin_id = admin_id_param;
END;
$$;

-- FIN DEL SCRIPT --
