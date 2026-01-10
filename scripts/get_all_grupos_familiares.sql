create or replace function get_all_grupos_familiares ()
returns json security definer
as $$
begin
    return (
        select
            json_agg(t)
        from (
            select
                gf.id,
                gf.nombre,
                gf.cuota_social,
                gf.tipo_cuota_id,
                gf.created_at,
                gf.titular_id,
                gf.activo, -- <<< AÑADIDO
                (
                    select
                        row_to_json(ct)
                    from
                        public.cuotas_tipos ct
                    where
                        ct.id = gf.tipo_cuota_id
                ) as cuotas_tipos,
                (
                    select
                        row_to_json(p)
                    from
                        (
                            select
                                id,
                                nombre_completo,
                                email,
                                dni,
                                telefono
                            from
                                public.profiles
                            where
                                id = gf.titular_id
                        ) p
                ) as profiles,
                (
                    select
                        coalesce(json_agg(mf), '[]'::json)
                    from
                        public.miembros_familia mf
                    where
                        mf.grupo_id = gf.id
                ) as miembros_familia
            from
                public.grupos_familiares gf
            order by
                gf.created_at desc
        ) t
    );
end;
$$ language plpgsql;