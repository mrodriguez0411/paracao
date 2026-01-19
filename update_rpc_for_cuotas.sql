-- =================================================================
-- SCRIPT PARA AJUSTAR LA FUNCIÓN RPC Y MOSTRAR ESTADO DE CUOTAS
-- =================================================================
-- INSTRUCCIONES:
-- 1. Ejecuta este script completo en tu editor SQL de Supabase.
--    Esto modifica la función para quitar email/teléfono y agregar el
--    estado de la cuota deportiva del mes actual, usando la tabla `actividades`.
-- =================================================================

-- PASO 1: Eliminar la función y el tipo antiguos.
DROP FUNCTION IF EXISTS public.get_miembros_por_disciplina(uuid);
DROP TYPE IF EXISTS public.miembro_disciplina CASCADE;

-- PASO 2: Crear el nuevo tipo de dato, con estado_cuota.
CREATE TYPE public.miembro_disciplina AS (
  id UUID,
  nombre_completo TEXT,
  dni TEXT,
  estado_cuota TEXT -- 'Al día' o 'Pendiente'
);

-- PASO 3: Crear la función actualizada.
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
    -- Lógica para obtener el estado de la cuota del mes actual
    COALESCE(
        (SELECT '''Al día'''
         FROM public.cuotas c
         JOIN public.actividades a ON c.actividad_id = a.id
         WHERE c.grupo_id = mf.grupo_id
           AND a.disciplina_id = d.id
           AND c.tipo = '''deportiva'''
           AND c.pagada = TRUE
           AND c.mes = EXTRACT(MONTH FROM NOW())
           AND c.anio = EXTRACT(YEAR FROM NOW())
         LIMIT 1), 
        '''Pendiente'''
    ) AS estado_cuota
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
