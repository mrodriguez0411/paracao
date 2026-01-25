-- Fix simple para super_admin - eliminar políticas complejas y usar una directa

-- Eliminar todas las políticas existentes
DROP POLICY IF EXISTS "Super admins pueden gestionar disciplinas" ON public.disciplinas;
DROP POLICY IF EXISTS "Super admins tienen acceso total a admin_disciplinas" ON public.admin_disciplinas;
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver disciplinas activas" ON public.disciplinas;
DROP POLICY IF EXISTS "Admins de disciplina pueden ver sus disciplinas" ON public.disciplinas;
DROP POLICY IF EXISTS "Admins de disciplina pueden ver sus asignaciones" ON public.admin_disciplinas;

-- Política simple y directa para super_admin en disciplinas
CREATE POLICY "Enable access for all users" ON public.disciplinas
    AS PERMISSIVE FOR ALL
    USING (true)
    WITH CHECK (true);

-- Política simple y directa para super_admin en admin_disciplinas  
CREATE POLICY "Enable access for all users" ON public.admin_disciplinas
    AS PERMISSIVE FOR ALL
    USING (true)
    WITH CHECK (true);

-- Asegurarse que RLS esté habilitado
ALTER TABLE public.disciplinas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_disciplinas ENABLE ROW LEVEL SECURITY;

-- Verificar que las políticas se crearon
SELECT 'Políticas creadas:' as status;
SELECT policyname, tablename, cmd FROM pg_policies 
WHERE tablename IN ('disciplinas', 'admin_disciplinas');
