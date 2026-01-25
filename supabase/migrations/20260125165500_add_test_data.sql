-- Agregar datos de prueba si no existen

-- Insertar disciplinas de prueba
INSERT INTO public.disciplinas (id, nombre, activa, admin_id, created_at)
SELECT 
    gen_random_uuid(),
    'Fútbol',
    true,
    (SELECT id FROM public.profiles WHERE rol = 'super_admin' LIMIT 1),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.disciplinas WHERE nombre = 'Fútbol');

INSERT INTO public.disciplinas (id, nombre, activa, admin_id, created_at)
SELECT 
    gen_random_uuid(),
    'Básquetbol',
    true,
    (SELECT id FROM public.profiles WHERE rol = 'super_admin' LIMIT 1),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.disciplinas WHERE nombre = 'Básquetbol');

INSERT INTO public.disciplinas (id, nombre, activa, admin_id, created_at)
SELECT 
    gen_random_uuid(),
    'Natación',
    true,
    (SELECT id FROM public.profiles WHERE rol = 'super_admin' LIMIT 1),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.disciplinas WHERE nombre = 'Natación');

-- Insertar admin_disciplinas de prueba
INSERT INTO public.admin_disciplinas (admin_id, disciplina_id, nombre)
SELECT 
    p.id,
    d.id,
    d.nombre
FROM public.profiles p
CROSS JOIN public.disciplinas d
WHERE p.rol = 'super_admin' 
AND d.nombre IN ('Fútbol', 'Básquetbol', 'Natación')
AND NOT EXISTS (
    SELECT 1 FROM public.admin_disciplinas ad 
    WHERE ad.admin_id = p.id AND ad.disciplina_id = d.id
);

-- Verificar los datos insertados
SELECT 'Disciplinas después de inserción:' as info;
SELECT id, nombre, activa, admin_id FROM public.disciplinas ORDER BY nombre;

SELECT 'Admin_disciplinas después de inserción:' as info;
SELECT admin_id, disciplina_id, nombre FROM public.admin_disciplinas;
