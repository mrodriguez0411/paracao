-- Habilitar RLS en la tabla 'actividades'
ALTER TABLE public.actividades ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas de gestión existentes para una instalación limpia
DROP POLICY IF EXISTS "Los administradores pueden gestionar las actividades" ON public.actividades;
DROP POLICY IF EXISTS "Super admins pueden gestionar actividades" ON public.actividades;
DROP POLICY IF EXISTS "Admins de disciplina pueden gestionar actividades" ON public.actividades;

-- Política SELECT para usuarios autenticados (asegurarse de que exista)
DROP POLICY IF EXISTS "Los usuarios autenticados pueden ver las actividades" ON public.actividades;
DROP POLICY IF EXISTS "Todos pueden ver actividades" ON public.actividades;
CREATE POLICY "Todos pueden ver actividades"
ON public.actividades
FOR SELECT
USING (auth.role() = 'authenticated');


-- Política para que los super_admins puedan gestionar todas las actividades (INSERT, UPDATE, DELETE)
CREATE POLICY "Super admins pueden gestionar actividades"
ON public.actividades
FOR ALL
USING (
  (public.get_user_role() = 'super_admin')
)
WITH CHECK (
  (public.get_user_role() = 'super_admin')
);
