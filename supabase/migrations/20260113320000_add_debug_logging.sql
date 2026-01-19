-- Create a table for logging debug information
CREATE TABLE IF NOT EXISTS public.debug_log (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id_from_auth UUID,
  retrieved_role TEXT,
  message TEXT
);

-- Recreate the function to add logging
-- This will replace the existing function
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean AS $$
DECLARE
  user_id_from_auth uuid;
  user_role text;
BEGIN
  -- Get the current user's ID
  user_id_from_auth := auth.uid();

  -- If there's no user, log it and return false
  IF user_id_from_auth IS NULL THEN
    INSERT INTO public.debug_log (user_id_from_auth, message)
    VALUES (NULL, 'auth.uid() was NULL.');
    RETURN false;
  END IF;

  -- Look up the role for the current user ID.
  SELECT rol INTO user_role
  FROM public.profiles
  WHERE id = user_id_from_auth;
  
  -- Log the retrieved information for debugging
  INSERT INTO public.debug_log (user_id_from_auth, retrieved_role)
  VALUES (user_id_from_auth, user_role);

  -- Return true if the user's role is 'super_admin', otherwise false.
  RETURN user_role = 'super_admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;