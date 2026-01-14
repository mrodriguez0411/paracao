-- VERSIÓN 22.0: Revierte la capacidad de pago y asegura que solo se muestren meses con cuotas generadas.

-- 1. Eliminar la función antigua por si acaso.
DROP FUNCTION IF EXISTS buscar_miembros_disciplina(integer, integer);

-- 2. Crear la función RPC con la lógica corregida.
CREATE OR REPLACE FUNCTION buscar_miembros_disciplina(
  anio_param integer,
  mes_param integer
)
RETURNS TABLE (
  id uuid,               -- ID de la inscripción (para keys únicas en React)
  activa boolean,
  nombre_miembro text,
  dni_miembro text,
  nombre_titular text,
  estado_cuota text,
  monto_cuota numeric,
  mes_cuota integer,
  anio_cuota integer
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    i.id,                          -- ID único de la inscripción
    i.activa,
    mf.nombre_completo AS nombre_miembro,
    mf.dni AS dni_miembro,
    p_titular.nombre_completo AS nombre_titular,
    CASE
      WHEN c.pagada = TRUE THEN 'Al día'
      ELSE 'Pendiente'
    END AS estado_cuota,
    c.monto AS monto_cuota, -- Se toma el monto de la cuota existente
    c.mes AS mes_cuota,
    c.anio AS anio_cuota
  FROM
    public.inscripciones i
    JOIN public.miembros_familia mf ON i.miembro_id = mf.id
    JOIN public.grupos_familiares gf ON mf.grupo_id = gf.id
    JOIN public.profiles p_titular ON gf.titular_id = p_titular.id
    JOIN public.disciplinas d ON i.disciplina_id = d.id
    -- CAMBIO CLAVE: INNER JOIN en lugar de LEFT JOIN.
    -- Esto asegura que solo se devuelvan filas si existe una cuota generada para ese mes/año.
    INNER JOIN public.cuotas c ON c.grupo_id = mf.grupo_id
      AND c.disciplina_id = i.disciplina_id
      AND c.mes = mes_param
      AND c.anio = anio_param
  WHERE
    d.admin_id = auth.uid();
$$;