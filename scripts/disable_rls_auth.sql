-- Deshabilitar RLS en tablas de autenticación para permitir creación de usuarios
-- Ejecutar este script en el SQL Editor de Supabase

-- Deshabilitar RLS en la tabla de usuarios de auth
ALTER TABLE auth.users DISABLE ROW LEVEL SECURITY;

-- Deshabilitar RLS en la tabla de sesiones de auth
ALTER TABLE auth.sessions DISABLE ROW LEVEL SECURITY;

-- Verificar el estado
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'auth' 
  AND tablename IN ('users', 'sessions');

-- Mostrar políticas existentes (si las hay)
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'auth';

-- Mensaje de confirmación
SELECT 'RLS deshabilitado en tablas de auth. Ahora puedes intentar crear usuarios.' as status;
