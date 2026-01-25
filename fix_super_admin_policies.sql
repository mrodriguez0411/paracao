-- Script para diagnosticar y corregir el problema de super_admin con disciplinas y admin_disciplinas

-- Primero, verifiquemos qué políticas existen actualmente
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('disciplinas', 'admin_disciplinas')
ORDER BY tablename, policyname;

-- Verificar si las funciones existen
SELECT 
    proname,
    prosrc
FROM pg_proc 
WHERE proname IN ('get_user_role', 'is_super_admin');

-- Eliminar todas las políticas existentes para disciplinas y admin_disciplinas
DROP POLICY IF EXISTS "Super admins pueden gestionar disciplinas" ON public.disciplinas;
DROP POLICY IF EXISTS "Super admins tienen acceso total a admin_disciplinas" ON public.admin_disciplinas;
DROP POLICY IF EXISTS "Todos pueden ver disciplinas activas" ON public.disciplinas;
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver disciplinas activas" ON public.disciplinas;

-- Asegurarse de que RLS esté habilitado
ALTER TABLE public.disciplinas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_disciplinas ENABLE ROW LEVEL SECURITY;

-- Crear/actualizar la función is_super_admin para que sea robusta
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean AS $$
DECLARE
  user_id uuid;
  user_role text;
BEGIN
  -- Get the current user's ID from the authentication context
  user_id := auth.uid();

  -- If there is no authenticated user, they cannot be a super_admin
  IF user_id IS NULL THEN
    RETURN false;
  END IF;

  -- Look up the role for the current user ID.
  -- This SELECT runs with the function definer's privileges (postgres),
  -- which bypasses any RLS policies on the public.profiles table.
  SELECT rol INTO user_role
  FROM public.profiles
  WHERE id = user_id;
  
  -- Return true if the user's role is 'super_admin', otherwise false.
  RETURN user_role = 'super_admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear políticas para super_admin usando la función is_super_admin
CREATE POLICY "Super admins pueden gestionar disciplinas"
  ON public.disciplinas
  FOR ALL
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

CREATE POLICY "Super admins tienen acceso total a admin_disciplinas"
  ON public.admin_disciplinas
  FOR ALL
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- Política para que todos los usuarios autenticados puedan ver disciplinas activas
CREATE POLICY "Usuarios autenticados pueden ver disciplinas activas"
  ON public.disciplinas
  FOR SELECT
  USING (auth.role() = 'authenticated' AND activa = true);

-- Política para que los admin_disciplina puedan ver sus disciplinas asignadas
CREATE POLICY "Admins de disciplina pueden ver sus disciplinas"
  ON public.disciplinas
  FOR SELECT
  USING (auth.role() = 'authenticated' AND admin_id = auth.uid());

CREATE POLICY "Admins de disciplina pueden ver sus asignaciones"
  ON public.admin_disciplinas
  FOR SELECT
  USING (auth.role() = 'authenticated' AND admin_id = auth.uid());

-- Verificar las políticas creadas
SELECT 
    'Políticas después de la corrección:' as info;

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename IN ('disciplinas', 'admin_disciplinas')
ORDER BY tablename, policyname;
