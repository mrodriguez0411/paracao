
-- =================================================================
-- SCRIPT PARA AÑADIR FECHA DE INSCRIPCIÓN Y ESTADO DE CUOTA
-- =================================================================
-- INSTRUCCIONES:
-- 1. Ejecuta este script completo en tu editor SQL de Supabase.
--    Reemplazará la función anterior con esta versión mejorada.
-- =================================================================

-- PASO 1: Eliminar la función y el tipo antiguos.
DROP FUNCTION IF EXISTS public.get_miembros_por_disciplina(uuid);
DROP TYPE IF EXISTS public.miembro_disciplina CASCADE;

-- PASO 2: Crear el nuevo tipo de dato, con fecha_inscripcion.
CREATE TYPE public.miembro_disciplina AS (
  id UUID,
  nombre_completo TEXT,
  dni TEXT,
  estado_cuota TEXT, -- 'Al día' o 'Pendiente'
  fecha_inscripcion TIMESTAMPTZ -- La fecha en que se inscribió a la disciplina
);

-- PASO 3: Crear la función actualizada incluyendo la fecha de inscripción.
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
    mf.dni,
    COALESCE(
        (SELECT '''Al día'''
         FROM public.cuotas c
         WHERE c.grupo_id = mf.grupo_id
           AND c.disciplina_id = d.id
           AND c.tipo = '''deportiva'''
           AND c.pagada = TRUE
           AND c.mes = EXTRACT(MONTH FROM NOW())
           AND c.anio = EXTRACT(YEAR FROM NOW())
         LIMIT 1), 
        '''Pendiente'''
    ) AS estado_cuota,
    i.fecha_inscripcion -- Campo añadido
  FROM 
    public.miembros_familia mf
  JOIN 
    public.inscripciones i ON mf.id = i.miembro_id
  JOIN 
    public.disciplinas d ON i.disciplina_id = d.id
  WHERE 
    d.admin_id = admin_id_param;
END;
$$;

-- FIN DEL SCRIPT --
