-- 1. Habilitar RLS en la tabla de perfiles si no está habilitado
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar políticas de selección conflictivas que puedan existir
DROP POLICY IF EXISTS "Los usuarios autenticados pueden ver los perfiles" ON public.profiles;

-- 3. Crear una política para permitir a los usuarios autenticados leer todos los perfiles
CREATE POLICY "Los usuarios autenticados pueden ver los perfiles"
  ON public.profiles
  FOR SELECT
  USING (auth.role() = 'authenticated');
