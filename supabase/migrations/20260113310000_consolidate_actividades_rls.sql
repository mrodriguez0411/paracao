-- The root cause of the problem was multiple conflicting policies.
-- This migration will remove ALL existing policies on the 'actividades' table
-- to ensure a clean slate, and then create a single, correct set of policies.

-- Drop all known and potential policies on 'public.actividades' to avoid conflicts.
DROP POLICY IF EXISTS "super_admin_select" ON public.actividades;
DROP POLICY IF EXISTS "super_admin_insert" ON public.actividades;
DROP POLICY IF EXISTS "super_admin_update" ON public.actividades;
DROP POLICY IF EXISTS "super_admin_delete" ON public.actividades;
DROP POLICY IF EXISTS "Los usuarios autenticados pueden ver las actividades" ON public.actividades;
DROP POLICY IF EXISTS "Los administradores pueden gestionar las actividades" ON public.actividades;
DROP POLICY IF EXISTS "Super admins can manage activities" ON public.actividades;
DROP POLICY IF EXISTS "Public can view activities" ON public.actividades;
DROP POLICY IF EXISTS "Super admins can manage all activities" ON public.actividades; -- Dropping the new one just in case of rerunning

-- We will continue to use the robust 'is_super_admin' function created previously.
-- No changes to the function are needed as it is correct.

-- RLS Policy 1: Allow public, unrestricted read access to all activities.
CREATE POLICY "Public can view activities"
ON public.actividades
FOR SELECT
USING (true);

-- RLS Policy 2: Allow super_admins to do everything (create, update, delete).
-- This will be the ONLY policy governing insert/update/delete, ensuring no conflicts.
CREATE POLICY "Super admins can manage all activities"
ON public.actividades
FOR ALL
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());
