
-- Function to get the full fee history for all activities within a disciplina managed by the current admin
CREATE OR REPLACE FUNCTION get_historial_cuotas_disciplina(
    p_mes INT,
    p_anio INT
)
RETURNS TABLE (
    actividad_id UUID,
    actividad_nombre TEXT,
    miembro_id UUID,
    nombre_completo TEXT,
    estado_pago TEXT,
    fecha_pago TIMESTAMPTZ,
    monto_pagado DECIMAL,
    cuota_id UUID
)
AS $$
DECLARE
    v_disciplina_id UUID;
    v_actividad RECORD;
BEGIN
    -- 1. Get the disciplina_id for the current admin from the junction table
    SELECT disciplina_id INTO v_disciplina_id
    FROM public.disciplina_admin
    WHERE admin_id = auth.uid()
    LIMIT 1;

    -- If the user is not an admin of any disciplina, return nothing
    IF v_disciplina_id IS NULL THEN
        RETURN;
    END IF;

    -- 2. Loop through all activities associated with that disciplina
    FOR v_actividad IN
        SELECT a.id, a.nombre
        FROM public.actividades a
        WHERE a.disciplina_id = v_disciplina_id
    LOOP
        -- 3. For each activity, call the previously created function and return its results, 
        --    adding the activity_id and activity_name to each row.
        RETURN QUERY
        SELECT
            v_actividad.id AS actividad_id,
            v_actividad.nombre AS actividad_nombre,
            t.miembro_id,
            t.nombre_completo,
            t.estado_pago,
            t.fecha_pago,
            t.monto_pagado,
            t.cuota_id
        FROM get_miembros_actividad_por_mes(v_actividad.id, p_mes, p_anio) AS t;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
