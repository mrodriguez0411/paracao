-- Habilitar RLS para tablas si aún no está hecho
ALTER TABLE public.disciplinas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_disciplinas ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas antiguas para evitar duplicados o conflictos
DROP POLICY IF EXISTS "Super admins pueden gestionar disciplinas" ON public.disciplinas;
DROP POLICY IF EXISTS "Super admins tienen acceso total a admin_disciplinas" ON public.admin_disciplinas;

-- Crear políticas para la tabla 'disciplinas'
CREATE POLICY "Super admins pueden gestionar disciplinas"
  ON public.disciplinas
  FOR ALL -- ALL significa SELECT, INSERT, UPDATE, DELETE
  USING (public.get_user_role() = 'super_admin')
  WITH CHECK (public.get_user_role() = 'super_admin');

-- Crear políticas para la tabla 'admin_disciplinas'
CREATE POLICY "Super admins tienen acceso total a admin_disciplinas"
  ON public.admin_disciplinas
  FOR ALL -- ALL significa SELECT, INSERT, UPDATE, DELETE
  USING (public.get_user_role() = 'super_admin')
  WITH CHECK (public.get_user_role() = 'super_admin');

-- Política para que los usuarios autenticados puedan leer disciplinas (si es necesario)
-- Por ahora la mantendremos restrictiva solo para super_admin.
-- Si otros roles necesitan ver las disciplinas, podemos añadir políticas aquí.
-- Ejemplo: 
-- CREATE POLICY "Usuarios autenticados pueden ver disciplinas activas"
--   ON public.disciplinas
--   FOR SELECT
--   USING (auth.role() = 'authenticated' AND estado = 'activa');
