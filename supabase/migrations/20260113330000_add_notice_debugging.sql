-- Clean up the debug table as it is no longer needed.
DROP TABLE IF EXISTS public.debug_log;

-- Recreate the function to use RAISE NOTICE for debugging.
-- Notices are not rolled back with the transaction, so we will see the output
-- even when the RLS check fails.
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean AS $$
DECLARE
  user_id_from_auth uuid;
  user_role text;
BEGIN
  -- Get the current user's ID from the session.
  user_id_from_auth := auth.uid();

  -- Raise a notice to log the user ID. This will appear in the database logs.
  RAISE NOTICE 'is_super_admin-debug: auth.uid() is % ', user_id_from_auth;

  -- If the user ID is null, we can stop here.
  IF user_id_from_auth IS NULL THEN
      RETURN false;
  END IF;

  -- Look up the role for the current user ID.
  SELECT rol INTO user_role
  FROM public.profiles
  WHERE id = user_id_from_auth;
  
  -- Raise a notice to log the role that was found.
  RAISE NOTICE 'is_super_admin-debug: Role found is % for user % ', user_role, user_id_from_auth;

  -- Return true if the user's role is 'super_admin', otherwise false.
  RETURN user_role = 'super_admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;