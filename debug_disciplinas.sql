-- Script para diagnosticar por qué el super_admin no ve las disciplinas

-- 1. Verificar si existen disciplinas en la base de datos
SELECT 'Disciplinas existentes:' as info;
SELECT COUNT(*) as total_disciplinas FROM public.disciplinas;
SELECT * FROM public.disciplinas LIMIT 5;

-- 2. Verificar si existen admin_disciplinas
SELECT 'Admin_disciplinas existentes:' as info;
SELECT COUNT(*) as total_admin_disciplinas FROM public.admin_disciplinas;
SELECT * FROM public.admin_disciplinas LIMIT 5;

-- 3. Verificar políticas actuales
SELECT 'Políticas actuales para disciplinas:' as info;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'disciplinas'
ORDER BY policyname;

SELECT 'Políticas actuales para admin_disciplinas:' as info;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'admin_disciplinas'
ORDER BY policyname;

-- 4. Verificar si la función is_super_admin funciona
SELECT 'Probando función is_super_admin:' as info;
SELECT public.is_super_admin() as resultado;

-- 5. Verificar usuarios con rol super_admin
SELECT 'Usuarios con rol super_admin:' as info;
SELECT id, email, rol FROM public.profiles WHERE rol = 'super_admin';

-- 6. Probar consulta directa (sin RLS) para confirmar datos
SELECT 'Consulta directa a disciplinas (sin RLS):' as info;
SET row_security TO OFF;
SELECT COUNT(*) as total_disciplinas_sin_rls FROM public.disciplinas;
SET row_security TO ON;

-- 7. Probar consulta como super_admin (simulando)
SELECT 'Simulando consulta como super_admin:' as info;
-- Esto debería funcionar si las políticas están correctas
SELECT COUNT(*) as total_disciplinas_con_rls FROM public.disciplinas WHERE public.is_super_admin();
