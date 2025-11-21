-- Add tipo_cuota_id column to grupos_familiares
ALTER TABLE public.grupos_familiares 
  ADD COLUMN tipo_cuota_id uuid REFERENCES public.cuotas_tipos(id);

-- Set a default value for existing records (you'll need to update this with a valid tipo_cuota_id)
-- UPDATE public.grupos_familiares SET tipo_cuota_id = 'default-tipo-cuota-id' WHERE tipo_cuota_id IS NULL;

-- Make the column required after backfilling data
-- ALTER TABLE public.grupos_familiares ALTER COLUMN tipo_cuota_id SET NOT NULL;
