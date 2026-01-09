-- Supabase migration script to keep user roles in sync with profiles table

-- 1. Create the function to update auth.users with the role from profiles
CREATE OR REPLACE FUNCTION public.update_user_role_on_profile_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the role column is being updated
  IF NEW.rol IS DISTINCT FROM OLD.rol THEN
    -- Update the user's role in the custom claims
    PERFORM supabase_functions.update_user_claim(NEW.id, 'role', NEW.rol);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the trigger to call the function on profile updates
DROP TRIGGER IF EXISTS on_profile_role_change ON public.profiles;
CREATE TRIGGER on_profile_role_change
  AFTER UPDATE OF rol ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_role_on_profile_change();
