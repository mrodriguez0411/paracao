
-- =================================================================
-- SCRIPT PARA AÑADIR FUNCIÓN DE HISTORIAL DE CUOTAS POR MES
-- =================================================================
-- INSTRUCCIONES:
-- 1. Ejecuta este script completo en tu editor SQL de Supabase.
--    Añadirá la nueva función `get_miembros_disciplina_por_mes`.
-- =================================================================

-- PASO 1: Crear el tipo de dato que devolverá la función.
-- Usamos un nombre nuevo para evitar conflictos y ser más claros.
CREATE TYPE public.miembro_estado_cuota AS (
  id UUID,
  nombre_completo TEXT,
  dni TEXT,
  fecha_inscripcion TIMESTAMPTZ,
  estado_cuota TEXT -- 'Al día' o 'Pendiente'
);

-- PASO 2: Crear la nueva función RPC.
CREATE OR REPLACE FUNCTION public.get_miembros_disciplina_por_mes(admin_id_param uuid, mes_param int, anio_param int)
RETURNS SETOF public.miembro_estado_cuota
LANGUAGE sql
STABLE
AS $$
  WITH disciplina_admin AS (
    -- Encontrar la disciplina que administra el usuario actual
    SELECT id FROM public.disciplinas WHERE admin_id = admin_id_param LIMIT 1
  )
  SELECT
    mf.id,
    p.nombre_completo,
    p.dni,
    md.fecha_inscripcion, -- Se incluye la fecha de inscripción para contexto
    COALESCE(
      (
        -- Subconsulta para verificar el estado de la cuota para el mes y año dados
        SELECT CASE WHEN c.pagada THEN 'Al día' ELSE 'Pendiente' END
        FROM public.cuotas c
        WHERE c.grupo_id = mf.grupo_id
          AND c.disciplina_id = (SELECT id FROM disciplina_admin)
          AND c.mes = mes_param
          AND c.anio = anio_param
        LIMIT 1
      ),
      'Pendiente' -- Si no existe un registro de cuota, se asume como Pendiente
    ) AS estado_cuota
  FROM
    public.miembros_disciplina md
  JOIN
    public.miembros_familia mf ON md.miembro_id = mf.id
  JOIN
    public.perfiles p ON mf.id = p.id
  WHERE
    md.disciplina_id = (SELECT id FROM disciplina_admin)
    AND md.fecha_inscripcion <= make_date(anio_param, mes_param, 1) -- Mostrar solo miembros inscriptos en o antes de ese mes
  ORDER BY
    p.nombre_completo;
$$;

-- FIN DEL SCRIPT --
