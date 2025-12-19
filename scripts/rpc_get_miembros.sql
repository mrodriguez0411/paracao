-- Este script crea una Función de Base de Datos (RPC) para obtener los miembros de la disciplina de un admin.
-- VERSIÓN 7.0: Utiliza la tabla `cuotas` según el esquema proporcionado por el usuario.

-- 1. Eliminar la función antigua si existe.
DROP FUNCTION IF EXISTS get_miembros_de_mi_disciplina();

-- 2. Crear la función RPC con la lógica de cuotas correcta.
CREATE OR REPLACE FUNCTION get_miembros_de_mi_disciplina()
RETURNS TABLE (
  id uuid,               -- ID de la inscripción
  activa boolean,
  nombre_miembro text,
  dni_miembro text,
  nombre_titular text,
  estado_cuota text      -- 'Al día' o 'Pendiente'
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    i.id, 
    i.activa,
    mf.nombre_completo AS nombre_miembro,
    mf.dni AS dni_miembro,
    p_titular.nombre_completo AS nombre_titular,
    -- Lógica corregida: Usa la tabla `cuotas` y la une por grupo y disciplina.
    COALESCE(
        (SELECT 'Al día'
         FROM public.cuotas c
         WHERE c.grupo_id = mf.grupo_id
           AND c.disciplina_id = i.disciplina_id
           AND c.mes = EXTRACT(MONTH FROM CURRENT_DATE)
           AND c.anio = EXTRACT(YEAR FROM CURRENT_DATE)
           AND c.pagada = TRUE
         LIMIT 1),
        'Pendiente'
    ) AS estado_cuota
  FROM
    public.inscripciones i
    JOIN public.miembros_familia mf ON i.miembro_id = mf.id
    JOIN public.grupos_familiares gf ON mf.grupo_id = gf.id
    JOIN public.profiles p_titular ON gf.titular_id = p_titular.id
  WHERE
    i.disciplina_id IN (
      SELECT d.id
      FROM public.disciplinas d
      WHERE d.admin_id = auth.uid()
    );
$$;
