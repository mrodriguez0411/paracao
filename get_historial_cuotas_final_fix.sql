-- =================================================================
-- SCRIPT DEFINITIVO BASADO EN EL ESQUEMA REAL DE LA BD
-- =================================================================
-- INSTRUCCIONES:
-- 1. Ejecuta este script completo en tu editor SQL de Supabase.
--    Utiliza las relaciones correctas entre tablas que me has proporcionado.
-- =================================================================

-- PASO 1: Eliminar el tipo anterior para una creación limpia.
DROP TYPE IF EXISTS public.miembro_estado_cuota CASCADE;

-- Crear el tipo de dato que devolverá la función.
CREATE TYPE public.miembro_estado_cuota AS (
  id UUID,
  nombre_completo TEXT,
  dni TEXT,
  fecha_inscripcion TIMESTAMPTZ,
  estado_cuota TEXT -- 'Al día' o 'Pendiente'
);

-- PASO 2: Crear la función RPC definitiva.
CREATE OR REPLACE FUNCTION public.get_miembros_disciplina_por_mes(admin_id_param uuid, anio_param int, mes_param int)
RETURNS SETOF public.miembro_estado_cuota
LANGUAGE sql
STABLE
AS $$
  WITH disciplina_admin AS (
    -- Encontrar la disciplina que administra el usuario actual
    SELECT id FROM public.disciplinas WHERE admin_id = admin_id_param LIMIT 1
  )
  SELECT
    p.id, -- El ID del perfil del miembro
    p.nombre_completo,
    p.dni,
    i.fecha_inscripcion,
    COALESCE(
      (
        -- Subconsulta para encontrar el estado de la cuota DEPORTIVA
        SELECT CASE WHEN c.pagada THEN 'Al día' ELSE 'Pendiente' END
        FROM public.cuotas c
        -- La cuota se une por el grupo familiar al que pertenece el miembro
        WHERE c.grupo_id = mf.grupo_id
          AND c.disciplina_id = (SELECT id FROM disciplina_admin)
          AND c.mes = mes_param
          AND c.anio = anio_param
          AND c.tipo = 'deportiva' -- Filtramos solo por cuotas deportivas
        LIMIT 1
      ),
      'Pendiente' -- Si no hay cuota registrada, se asume pendiente
    ) AS estado_cuota
  FROM
    public.inscripciones i
  -- Unimos inscripciones con miembros_familia para obtener el grupo_id
  JOIN
    public.miembros_familia mf ON i.miembro_id = mf.id
  -- Unimos miembros_familia con profiles para obtener los datos del miembro
  JOIN
    public.profiles p ON mf.socio_id = p.id
  WHERE
    i.disciplina_id = (SELECT id FROM disciplina_admin)
    AND i.activa = true
    AND i.fecha_inscripcion <= make_date(anio_param, mes_param, 1)
  ORDER BY
    p.nombre_completo;
$$;

-- FIN DEL SCRIPT --