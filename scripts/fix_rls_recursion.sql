-- 1. Primero, deshabilitar RLS temporalmente en la tabla profiles
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 2. Eliminar políticas existentes en profiles
DROP POLICY IF EXISTS "Los usuarios pueden ver su propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Super admins pueden ver todos los perfiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins de disciplina pueden ver perfiles de sus socios" ON public.profiles;

-- 3. Crear una función que verifique el rol usando auth.jwt() directamente
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text AS $$
DECLARE
  user_role text;
BEGIN
  -- Obtener el rol directamente del token JWT
  SELECT raw_user_meta_data->>'role' INTO user_role
  FROM auth.users
  WHERE id = auth.uid();
  
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Habilitar RLS nuevamente
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. Recrear políticas usando la nueva función
-- Política para que los usuarios vean su propio perfil
CREATE POLICY "Los usuarios pueden ver su propio perfil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Política para super admins (usando la función que evita recursión)
CREATE POLICY "Super admins pueden ver todos los perfiles"
  ON public.profiles FOR SELECT
  USING (public.get_user_role() = 'super_admin');

-- Política para admins de disciplina
CREATE POLICY "Admins de disciplina pueden ver perfiles de sus socios"
  ON public.profiles FOR SELECT
  USING (public.get_user_role() = 'admin_disciplina');

-- 6. Actualizar políticas en otras tablas
DO $$
BEGIN
  -- Actualizar política en disciplinas
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'disciplinas' 
    AND policyname = 'Super admins pueden gestionar disciplinas'
  ) THEN
    EXECUTE 'DROP POLICY "Super admins pueden gestionar disciplinas" ON public.disciplinas';
  END IF;
  
  EXECUTE 'CREATE POLICY "Super admins pueden gestionar disciplinas"
    ON public.disciplinas FOR ALL
    USING (public.get_user_role() = ''super_admin'')
    WITH CHECK (public.get_user_role() = ''super_admin'');';
    
  -- Actualizar política en grupos_familiares
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'grupos_familiares' 
    AND policyname = 'Super admins pueden gestionar grupos'
  ) THEN
    EXECUTE 'DROP POLICY "Super admins pueden gestionar grupos" ON public.grupos_familiares';
  END IF;
  
  EXECUTE 'CREATE POLICY "Super admins pueden gestionar grupos"
    ON public.grupos_familiares FOR ALL
    USING (public.get_user_role() = ''super_admin'')
    WITH CHECK (public.get_user_role() = ''super_admin'');';
    
  -- Actualizar política en miembros_familia
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'miembros_familia' 
    AND policyname = 'Super admins pueden gestionar miembros'
  ) THEN
    EXECUTE 'DROP POLICY "Super admins pueden gestionar miembros" ON public.miembros_familia';
  END IF;
  
  EXECUTE 'CREATE POLICY "Super admins pueden gestionar miembros"
    ON public.miembros_familia FOR ALL
    USING (public.get_user_role() = ''super_admin'')
    WITH CHECK (public.get_user_role() = ''super_admin'');';
    
  -- Actualizar política en inscripciones
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'inscripciones' 
    AND policyname = 'Super admins pueden gestionar inscripciones'
  ) THEN
    EXECUTE 'DROP POLICY "Super admins pueden gestionar inscripciones" ON public.inscripciones';
  END IF;
  
  EXECUTE 'CREATE POLICY "Super admins pueden gestionar inscripciones"
    ON public.inscripciones FOR ALL
    USING (public.get_user_role() = ''super_admin'')
    WITH CHECK (public.get_user_role() = ''super_admin'');';
    
END $$;
