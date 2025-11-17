-- Agregar columna dni a la tabla profiles
ALTER TABLE public.profiles
ADD COLUMN dni text UNIQUE;

-- Crear índice en dni para búsquedas más rápidas
CREATE INDEX idx_profiles_dni ON public.profiles(dni);
