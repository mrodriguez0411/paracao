-- Script para obtener los resultados del diagnóstico y mostrarlos

-- El problema puede ser que las consultas SELECT en migraciones no muestran resultados
-- Vamos a crear una tabla temporal para almacenar los resultados

CREATE TEMP TABLE IF NOT EXISTS debug_results (
    step_number INTEGER,
    description TEXT,
    result_data JSONB
);

-- 1. Contar disciplinas
INSERT INTO debug_results (step_number, description, result_data)
SELECT 1, 'Total disciplinas', jsonb_build_object('count', COUNT(*))
FROM public.disciplinas;

-- 2. Mostrar primeras 5 disciplinas
INSERT INTO debug_results (step_number, description, result_data)
SELECT 2, 'Primeras 5 disciplinas', jsonb_agg(to_jsonb(d))
FROM (
    SELECT id, nombre, activa, admin_id, created_at 
    FROM public.disciplinas 
    LIMIT 5
) d;

-- 3. Contar admin_disciplinas
INSERT INTO debug_results (step_number, description, result_data)
SELECT 3, 'Total admin_disciplinas', jsonb_build_object('count', COUNT(*))
FROM public.admin_disciplinas;

-- 4. Mostrar políticas
INSERT INTO debug_results (step_number, description, result_data)
SELECT 4, 'Políticas disciplinas', jsonb_agg(jsonb_build_object(
    'policyname', policyname,
    'cmd', cmd,
    'permissive', permissive
))
FROM pg_policies 
WHERE tablename = 'disciplinas';

INSERT INTO debug_results (step_number, description, result_data)
SELECT 5, 'Políticas admin_disciplinas', jsonb_agg(jsonb_build_object(
    'policyname', policyname,
    'cmd', cmd,
    'permissive', permissive
))
FROM pg_policies 
WHERE tablename = 'admin_disciplinas';

-- 5. Usuarios super_admin
INSERT INTO debug_results (step_number, description, result_data)
SELECT 6, 'Usuarios super_admin', jsonb_agg(jsonb_build_object(
    'id', id,
    'email', email,
    'rol', rol
))
FROM public.profiles 
WHERE rol = 'super_admin';

-- Mostrar todos los resultados
SELECT step_number, description, result_data 
FROM debug_results 
ORDER BY step_number;

-- Limpiar
DROP TABLE IF EXISTS debug_results;
