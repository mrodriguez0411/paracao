
-- =================================================================
-- SCRIPT FINAL CON LÓGICA DE UNIÓN CORREGIDA (LEFT JOIN)
-- =================================================================
-- INSTRUCCIONES:
-- 1. Ejecuta este script completo en tu editor SQL de Supabase.
--    Esto ajusta la lógica para incluir a todos los miembros, 
--    incluso si no tienen un perfil de usuario directo.
-- =================================================================

-- PASO 1: Eliminar la función y el tipo anteriores para una instalación limpia.
DROP FUNCTION IF EXISTS public.get_miembros_por_disciplina(uuid);
DROP TYPE IF EXISTS public.miembro_disciplina CASCADE;

-- PASO 2: Recrear el tipo de dato que la función devolverá.
CREATE TYPE public.miembro_disciplina AS (
  id UUID,
  nombre_completo TEXT,
  email TEXT,       -- Puede ser NULL
  telefono TEXT,    -- Puede ser NULL
  dni TEXT,
  created_at TIMESTAMPTZ
);

-- PASO 3: Crear la función con la unión (JOIN) corregida a LEFT JOIN.
CREATE OR REPLACE FUNCTION public.get_miembros_por_disciplina(admin_id_param uuid)
RETURNS SETOF public.miembro_disciplina
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY 
  SELECT 
    mf.id,                
    mf.nombre_completo,     
    p.email,                -- Vendrá como NULL si no hay perfil asociado.
    p.telefono,             -- Vendrá como NULL si no hay perfil asociado.
    mf.dni,                 
    mf.created_at           
  FROM 
    public.miembros_familia mf
  JOIN 
    public.inscripciones i ON mf.id = i.miembro_id
  JOIN 
    public.disciplinas d ON i.disciplina_id = d.id
  -- LA CORRECCIÓN FINAL: Cambiamos a LEFT JOIN.
  -- Esto asegura que incluyamos a todos los miembros de la disciplina,
  -- tengan o no un `socio_id` que corresponda a un perfil.
  LEFT JOIN 
    public.profiles p ON mf.socio_id = p.id
  WHERE 
    d.admin_id = admin_id_param;
END;
$$;

-- FIN DEL SCRIPT --
