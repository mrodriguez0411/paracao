-- =================================================================
-- SCRIPT RPC CORREGIDO (v6 - VERSIÓN DEFINITIVA CON SECURITY INVOKER)
-- =================================================================
-- INSTRUCCIONES:
-- 1. Ejecuta este script completo en tu editor SQL de Supabase.
--    Esta versión corrige el conflicto de seguridad y está diseñada
--    para funcionar con las políticas RLS que ya has instalado.
-- =================================================================

-- PASO 1: Eliminar la función y el tipo anteriores para una instalación limpia.
DROP FUNCTION IF EXISTS public.get_miembros_por_disciplina(uuid);
DROP FUNCTION IF EXISTS public.get_miembros_por_disciplina();
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

-- PASO 3: Crear la función con la lógica de seguridad corregida.
CREATE OR REPLACE FUNCTION public.get_miembros_por_disciplina()
RETURNS SETOF public.miembro_disciplina
LANGUAGE plpgsql
SECURITY INVOKER -- <<< CAMBIO CRÍTICO: Se ejecuta con los permisos del usuario que llama.
AS $$
DECLARE
  disciplina_id_del_admin UUID;
BEGIN
  -- Primero, encontramos la disciplina que administra el usuario actual (auth.uid()).
  SELECT ad.disciplina_id INTO disciplina_id_del_admin
  FROM public.admin_disciplinas ad
  WHERE ad.admin_id = auth.uid();

  -- Si el admin no tiene una disciplina asignada, no devolvemos nada.
  IF disciplina_id_del_admin IS NULL THEN
    RETURN;
  END IF;

  -- Esta consulta ahora se ejecutará con los permisos del usuario, y la política
  -- de seguridad (RLS) sobre 'inscripciones' permitirá el acceso correctamente.
  RETURN QUERY
  SELECT
    mf.id,
    mf.nombre_completo,
    p.email,
    p.telefono,
    mf.dni,
    mf.created_at
  FROM
    public.miembros_familia mf
  JOIN
    public.inscripciones i ON mf.id = i.miembro_id
  LEFT JOIN
    public.profiles p ON mf.socio_id = p.id
  WHERE
    i.disciplina_id = disciplina_id_del_admin AND i.activa = TRUE;
END;
$$;

-- FIN DEL SCRIPT --
