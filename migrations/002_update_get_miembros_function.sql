CREATE OR REPLACE FUNCTION get_miembros_de_mi_disciplina(
    p_mes INT,
    p_anio INT
)
RETURNS TABLE (
    inscripcion_id TEXT,
    nombre_completo TEXT,
    perfil_id TEXT,
    grupo_familiar_id TEXT,
    disciplina_id TEXT,
    disciplina_nombre TEXT,
    fecha_inscripcion DATE,
    activo BOOLEAN,
    estado_cuota TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
    auth_user_id UUID;
BEGIN
    -- Obtenemos el ID de usuario autenticado desde el contexto de Supabase
    auth_user_id := auth.uid();

    -- Lanzamos una excepción si el usuario no está autenticado (por si acaso)
    IF auth_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuario no autenticado.';
    END IF;

    RETURN QUERY
    WITH admin_disciplina AS (
        SELECT da.disciplina_id
        FROM public.disciplina_admins da
        WHERE da.perfil_id = auth_user_id
        LIMIT 1 -- Asumimos que un admin gestiona una sola disciplina
    )
    SELECT
        i.id::TEXT AS inscripcion_id,
        p.nombre_completo,
        p.id::TEXT AS perfil_id,
        gf.id::TEXT AS grupo_familiar_id,
        d.id::TEXT AS disciplina_id,
        d.nombre AS disciplina_nombre,
        i.fecha_inscripcion,
        i.activa AS activo,
        -- Lógica mejorada para determinar el estado de la cuota
        CASE
            WHEN c.id IS NULL THEN 'Pendiente' -- No se encontró cuota para ese mes/año
            WHEN c.estado = 'pagada' THEN 'Al día'
            ELSE 'Pendiente'
        END AS estado_cuota
    FROM
        public.inscripciones i
    JOIN
        public.perfiles p ON i.perfil_id = p.id
    JOIN
        public.disciplinas d ON i.disciplina_id = d.id
    JOIN
        public.grupos_familiares gf ON p.grupo_familiar_id = gf.id
    LEFT JOIN
        public.cuotas c ON i.id = c.inscripcion_id AND c.mes = p_mes AND c.anio = p_anio
    WHERE
        i.disciplina_id = (SELECT disciplina_id FROM admin_disciplina)
    ORDER BY
        p.nombre_completo;
END;
$$;
