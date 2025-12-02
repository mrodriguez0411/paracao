
-- =================================================================
-- SCRIPT CORREGIDO (V2) PARA HISTORIAL DE CUOTAS
-- =================================================================
-- INSTRUCCIONES:
-- 1. Ejecuta este script completo en tu editor SQL de Supabase.
--    Reemplazará la función anterior con la versión que usa el nombre de tabla correcto.
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

-- PASO 2: Crear la función RPC con el nombre de tabla corregido.
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
    p.id, -- Usamos el ID del perfil directamente
    p.nombre_completo,
    p.dni,
    sd.fecha_inscripcion, -- Se incluye la fecha de inscripción para contexto
    COALESCE(
      (
        -- Subconsulta para verificar el estado de la cuota para el mes y año dados
        SELECT CASE WHEN c.pagada THEN 'Al día' ELSE 'Pendiente' END
        FROM public.cuotas c
        WHERE c.socio_id = p.id -- La cuota está vinculada al socio_id (perfil)
          AND c.disciplina_id = (SELECT id FROM disciplina_admin)
          AND c.mes = mes_param
          AND c.anio = anio_param
        LIMIT 1
      ),
      'Pendiente' -- Si no existe un registro de cuota, se asume como Pendiente
    ) AS estado_cuota
  FROM
    public.socios_disciplinas sd -- <<< CORRECCIÓN CLAVE: Tabla correcta
  JOIN
    public.perfiles p ON sd.socio_id = p.id
  WHERE
    sd.disciplina_id = (SELECT id FROM disciplina_admin)
    AND sd.fecha_inscripcion <= make_date(anio_param, mes_param, 1) -- Mostrar solo miembros inscriptos en o antes de ese mes
  ORDER BY
    p.nombre_completo;
$$;

-- FIN DEL SCRIPT --
