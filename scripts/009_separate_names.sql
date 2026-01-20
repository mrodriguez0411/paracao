-- Disable RLS on the tables to modify them
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.miembros_familia DISABLE ROW LEVEL SECURITY;

-- #### PROFILES TABLE ####

-- 1. Add nombre and apellido columns
ALTER TABLE public.profiles
ADD COLUMN nombre text,
ADD COLUMN apellido text;

-- 2. Migrate data from nombre_completo to a new columns
UPDATE public.profiles
SET
  nombre = (regexp_split_to_array(nombre_completo, E'\\s+'))[1],
  apellido = array_to_string((regexp_split_to_array(nombre_completo, E'\\s+'))[2:], ' ');

UPDATE public.profiles SET nombre = '' WHERE nombre IS NULL;
UPDATE public.profiles SET apellido = '' WHERE apellido IS NULL;

ALTER TABLE public.profiles
ALTER COLUMN nombre SET NOT NULL,
ALTER COLUMN apellido SET NOT NULL;


-- 4. Drop the old nombre_completo column
ALTER TABLE public.profiles
DROP COLUMN nombre_completo;


-- #### MIEMBROS_FAMILIA TABLE ####

-- 1. Add nombre and apellido columns
ALTER TABLE public.miembros_familia
ADD COLUMN nombre text,
ADD COLUMN apellido text;

-- 2. Migrate data from nombre_completo to a new columns
UPDATE public.miembros_familia
SET
  nombre = (regexp_split_to_array(nombre_completo, E'\\s+'))[1],
  apellido = array_to_string((regexp_split_to_array(nombre_completo, E'\\s+'))[2:], ' ');

UPDATE public.miembros_familia SET nombre = '' WHERE nombre IS NULL;
UPDATE public.miembros_familia SET apellido = '' WHERE apellido IS NULL;

-- 3. Set NOT NULL constraint
ALTER TABLE public.miembros_familia
ALTER COLUMN nombre SET NOT NULL,
ALTER COLUMN apellido SET NOT NULL;

-- 4. Drop the old nombre_completo column
ALTER TABLE public.miembros_familia
DROP COLUMN nombre_completo;

-- Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.miembros_familia ENABLE ROW LEVEL SECURITY;
