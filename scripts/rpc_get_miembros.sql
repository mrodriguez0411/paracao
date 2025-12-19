-- Este script crea una Función de Base de Datos (RPC) para obtener los miembros de la disciplina de un admin.
-- VERSIÓN 4.0: Nomenclatura final y consistente.

-- 1. Eliminar la función antigua si existe.
DROP FUNCTION IF EXISTS get_miembros_de_mi_disciplina();

-- 2. Crear la función RPC con nombres de columna definitivos y consistentes.
CREATE OR REPLACE FUNCTION get_miembros_de_mi_disciplina()
RETURNS TABLE (
  id uuid,               -- ID de la inscripción
  activa boolean,
  nombre_miembro text,   -- CORREGIDO Y DEFINITIVO
  dni_miembro text,      -- CORREGIDO Y DEFINITIVO
  nombre_titular text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    i.id, 
    i.activa,
    mf.nombre_completo AS nombre_miembro, -- Alias consistente
    mf.dni AS dni_miembro,             -- Alias consistente
    p_titular.nombre_completo AS nombre_titular
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
