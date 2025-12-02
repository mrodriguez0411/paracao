-- =================================================================
-- SCRIPT CON LÓGICA DE FECHA CORREGIDA
-- =================================================================
-- INSTRUCCIONES:
-- 1. Ejecuta este script. Corrige el filtro de fecha para que
--    incluya a los miembros inscritos en cualquier momento del mes seleccionado.
-- =================================================================

-- PASO 1: (Opcional) Eliminar el tipo anterior para una creación limpia.
DROP TYPE IF EXISTS public.miembro_estado_cuota CASCADE;

-- Crear el tipo de dato que devolverá la función.
CREATE TYPE public.miembro_estado_cuota AS (
  id UUID,
  nombre_completo TEXT,
  dni TEXT,
  fecha_inscripcion TIMESTAMPTZ,
  estado_cuota TEXT -- 'Al día' o 'Pendiente'
);

-- PASO 2: Reemplazar la función con la lógica de fecha corregida.
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
    p.id,
    p.nombre_completo,
    p.dni,
    i.fecha_inscripcion,
    COALESCE(
      (
        SELECT CASE WHEN c.pagada THEN 'Al día' ELSE 'Pendiente' END
        FROM public.cuotas c
        WHERE c.grupo_id = mf.grupo_id
          AND c.disciplina_id = (SELECT id FROM disciplina_admin)
          AND c.mes = mes_param
          AND c.anio = anio_param
          AND c.tipo = 'deportiva'
        LIMIT 1
      ),
      'Pendiente'
    ) AS estado_cuota
  FROM
    public.inscripciones i
  JOIN
    public.miembros_familia mf ON i.miembro_id = mf.id
  JOIN
    public.profiles p ON mf.socio_id = p.id
  WHERE
    i.disciplina_id = (SELECT id FROM disciplina_admin)
    AND i.activa = true
    -- <<< CORRECCIÓN CLAVE DE LÓGICA >>>
    -- Mostrar miembros cuya inscripción sea anterior al INICIO DEL MES SIGUIENTE.
    -- Esto incluye correctamente a todos los inscritos durante el mes seleccionado.
    AND i.fecha_inscripcion < (make_date(anio_param, mes_param, 1) + interval '1 month')
  ORDER BY
    p.nombre_completo;
$$;

-- FIN DEL SCRIPT --