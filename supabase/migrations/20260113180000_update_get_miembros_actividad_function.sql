
-- Function to get members of a specific activity for a given month and year, including their payment status
CREATE OR REPLACE FUNCTION get_miembros_actividad_por_mes(
    p_actividad_id UUID,
    p_mes INT,
    p_anio INT
)
RETURNS TABLE (
    miembro_id UUID,
    nombre_completo TEXT,
    estado_pago TEXT,
    fecha_pago TIMESTAMPTZ,
    monto_pagado DECIMAL,
    cuota_id UUID
)
AS $$
BEGIN
    RETURN QUERY
    SELECT
        m.id AS miembro_id,
        m.nombre_completo,
        CASE
            WHEN c.pagada THEN 'Pagada'
            ELSE 'Pendiente'
        END AS estado_pago,
        c.fecha_pago,
        c.monto AS monto_pagado,
        c.id AS cuota_id
    FROM
        public.miembros_familia m
    JOIN
        public.inscripciones i ON m.id = i.miembro_id
    LEFT JOIN
        public.cuotas c ON m.grupo_id = c.grupo_id
                         AND c.actividad_id = i.actividad_id
                         AND c.mes = p_mes
                         AND c.anio = p_anio
                         AND c.tipo = 'deportiva'
    WHERE
        i.actividad_id = p_actividad_id
        AND i.activa = TRUE;
END;
$$ LANGUAGE plpgsql;
