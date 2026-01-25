
-- Enable RLS for relevant tables
ALTER TABLE public.grupos_familiares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.miembros_familia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cuotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inscripciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to prevent conflicts
DROP POLICY IF EXISTS "Socios can view their own family group." ON public.grupos_familiares;
DROP POLICY IF EXISTS "Socios can view members of their own family group." ON public.miembros_familia;
DROP POLICY IF EXISTS "Socios can view cuotas of their own family group." ON public.cuotas;
DROP POLICY IF EXISTS "Socios can view inscripciones of their own family group." ON public.inscripciones;
DROP POLICY IF EXISTS "Users can view their own profile." ON public.profiles;

-- RLS Policies for "socio" role

-- Allow socios to view their own family group
CREATE POLICY "Socios can view their own family group."
ON public.grupos_familiares
FOR SELECT
TO authenticated
USING (titular_id = auth.uid());

-- Allow socios to view members of their family group
CREATE POLICY "Socios can view members of their own family group."
ON public.miembros_familia
FOR SELECT
TO authenticated
USING (
  grupo_id IN (
    SELECT id FROM public.grupos_familiares WHERE titular_id = auth.uid()
  )
);

-- Allow socios to view cuotas of their family group
CREATE POLICY "Socios can view cuotas of their own family group."
ON public.cuotas
FOR SELECT
TO authenticated
USING (
  grupo_id IN (
    SELECT id FROM public.grupos_familiares WHERE titular_id = auth.uid()
  )
);

-- Allow socios to view inscripciones of their family group
CREATE POLICY "Socios can view inscripciones of their own family group."
ON public.inscripciones
FOR SELECT
TO authenticated
USING (
  miembro_id IN (
    SELECT id FROM public.miembros_familia WHERE grupo_id IN (
      SELECT id FROM public.grupos_familiares WHERE titular_id = auth.uid()
    )
  )
);

-- Allow users to view their own profile
CREATE POLICY "Users can view their own profile."
ON public.profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());
