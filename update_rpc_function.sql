
-- =================================================================
-- SCRIPT PARA CORREGIR Y REEMPLAZAR LA FUNCIÓN RPC
-- =================================================================
-- INSTRUCCIONES:
-- 1. Ejecuta este script completo en tu editor SQL de Supabase.
--    Esto reemplazará la función anterior por la versión correcta.
-- =================================================================

-- PASO 1: Eliminar la función y el tipo antiguos para evitar conflictos.
-- Usamos CASCADE para que también elimine la dependencia en la función.
DROP FUNCTION IF EXISTS public.get_miembros_por_disciplina(uuid);
DROP TYPE IF EXISTS public.miembro_disciplina CASCADE;

-- PASO 2: Recrear el tipo de dato que la función devolverá.
-- La estructura del tipo sigue siendo correcta.
CREATE TYPE public.miembro_disciplina AS (
  id UUID,
  nombre_completo TEXT,
  email TEXT,
  telefono TEXT,
  dni TEXT,
  created_at TIMESTAMPTZ
);

-- PASO 3: Crear la función corregida.
CREATE OR REPLACE FUNCTION public.get_miembros_por_disciplina(admin_id_param uuid)
RETURNS SETOF public.miembro_disciplina
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY 
  SELECT 
    mf.id, -- El ID del miembro, de la tabla miembros_familia
    mf.nombre_completo, -- El nombre, de la tabla miembros_familia
    p.email, -- ¡CORREGIDO! El email, ahora desde la tabla profiles
    p.telefono, -- ¡CORREGIDO! El teléfono, ahora desde la tabla profiles
    p.dni, -- ¡CORREGIDO! El DNI, ahora desde la tabla profiles
    mf.created_at
  FROM 
    public.miembros_familia mf
  JOIN 
    public.inscripciones i ON mf.id = i.miembro_id
  JOIN 
    public.disciplinas d ON i.disciplina_id = d.id
  -- ¡LA CORRECCIÓN CLAVE! Unimos con la tabla `profiles` para obtener los datos personales.
  -- Estoy asumiendo que la conexión es `miembros_familia.user_id` -> `profiles.id`
  JOIN 
    public.profiles p ON mf.user_id = p.id
  WHERE 
    d.admin_id = admin_id_param;
END;
$$;

-- FIN DEL SCRIPT --
