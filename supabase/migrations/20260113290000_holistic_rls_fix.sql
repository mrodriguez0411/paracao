-- Drop all dependent policies and the old function
DROP POLICY IF EXISTS "Los super administradores tienen acceso total." ON public.miembros_familia;
DROP POLICY IF EXISTS "Super admins can manage activities" ON public.actividades;
DROP POLICY IF EXISTS "Public can view activities" ON public.actividades;
DROP FUNCTION IF EXISTS public.is_super_admin();

-- Create the definitive, robust function to check for super_admin role
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

-- RLS Policy for actividades: Allow public, unrestricted read access.
CREATE POLICY "Public can view activities"
ON public.actividades
FOR SELECT
USING (true);

-- RLS Policy for actividades: Allow super_admins to manage everything.
CREATE POLICY "Super admins can manage activities"
ON public.actividades
FOR ALL
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

-- RLS Policy for miembros_familia: Restore the original policy.
CREATE POLICY "Los super administradores tienen acceso total."
ON public.miembros_familia
FOR ALL
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());
