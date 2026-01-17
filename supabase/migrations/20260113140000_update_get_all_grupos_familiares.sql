CREATE OR REPLACE FUNCTION get_all_grupos_familiares()
RETURNS JSON
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN (
    SELECT json_agg(
      json_build_object(
        'id', gf.id,
        'nombre', gf.nombre,
        'tipo_cuota_id', gf.tipo_cuota_id,
        'activo', gf.activo,
        'created_at', gf.created_at,
        'titular_id', gf.titular_id,
        'cuotas_tipos', (
          SELECT json_build_object(
            'id', ct.id,
            'nombre', ct.nombre,
            'monto', ct.monto
          )
          FROM cuotas_tipos ct
          WHERE ct.id = gf.tipo_cuota_id
        ),
        'profiles', (
          SELECT json_build_object(
            'id', p.id,
            'nombre_completo', p.nombre_completo,
            'email', p.email,
            'dni', p.dni,
            'edad', p.edad
          )
          FROM profiles p
          WHERE p.id = gf.titular_id
        ),
        'miembros_familia', (
          SELECT COALESCE(json_agg(
            json_build_object(
              'id', mf.id,
              'nombre_completo', mf.nombre_completo,
              'dni', mf.dni,
              'parentesco', mf.parentesco,
              'socio_id', mf.socio_id,
              'fecha_nacimiento', mf.fecha_nacimiento,
              'edad', mf.edad,
              'created_at', mf.created_at,
              'inscripciones', (
                 SELECT COALESCE(json_agg(
                    json_build_object(
                      'disciplina_id', i.disciplina_id,
                      'disciplinas', (
                        SELECT json_build_object('id', d.id, 'nombre', d.nombre)
                        FROM disciplinas d WHERE d.id = i.disciplina_id
                      )
                    )
                  ), '[]'::json) FROM inscripciones i WHERE i.miembro_id = mf.id
              )
            )
          ), '[]'::json) FROM miembros_familia mf WHERE mf.grupo_id = gf.id
        )
      )
    )
    FROM grupos_familiares gf
  );
END;
$$;