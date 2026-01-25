-- Verificar si realmente existen datos en las tablas

-- Crear tabla temporal para almacenar resultados
CREATE TEMP TABLE IF NOT EXISTS verification_results (
    table_name TEXT,
    record_count INTEGER,
    sample_data JSONB
);

-- Verificar disciplinas
INSERT INTO verification_results (table_name, record_count, sample_data)
SELECT 
    'disciplinas',
    COUNT(*),
    (SELECT jsonb_agg(to_jsonb(d)) FROM (
        SELECT id, nombre, activa, admin_id, created_at 
        FROM public.disciplinas 
        LIMIT 3
    ) d)
FROM public.disciplinas;

-- Verificar admin_disciplinas
INSERT INTO verification_results (table_name, record_count, sample_data)
SELECT 
    'admin_disciplinas',
    COUNT(*),
    (SELECT jsonb_agg(to_jsonb(ad)) FROM (
        SELECT admin_id, disciplina_id, nombre 
        FROM public.admin_disciplinas 
        LIMIT 3
    ) ad)
FROM public.admin_disciplinas;

-- Verificar profiles (para confirmar que hay usuarios)
INSERT INTO verification_results (table_name, record_count, sample_data)
SELECT 
    'profiles',
    COUNT(*),
    (SELECT jsonb_agg(to_jsonb(p)) FROM (
        SELECT id, email, rol 
        FROM public.profiles 
        LIMIT 3
    ) p)
FROM public.profiles;

-- Mostrar resultados
SELECT table_name, record_count, sample_data 
FROM verification_results 
ORDER BY table_name;

-- Limpiar
DROP TABLE IF EXISTS verification_results;
