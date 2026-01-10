CREATE OR REPLACE FUNCTION get_super_admin_dashboard_stats()
RETURNS TABLE (
    grupos_familiares_count BIGINT,
    disciplinas_activas_count BIGINT,
    cuotas_pendientes_count BIGINT,
    recaudado_mes_sum NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT count(*) FROM public.grupos_familiares),
        (SELECT count(*) FROM public.disciplinas WHERE estado = 'activa'),
        (SELECT count(*) FROM public.cuotas WHERE estado = 'pendiente'),
        (SELECT COALESCE(sum(monto), 0) FROM public.pagos WHERE fecha_pago >= date_trunc('month', now()));
END;
$$;
