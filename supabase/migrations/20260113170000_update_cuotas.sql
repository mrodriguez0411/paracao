-- 1. Add actividad_id column, nullable for now
ALTER TABLE public.cuotas
ADD COLUMN actividad_id UUID REFERENCES public.actividades(id) ON DELETE SET NULL;

-- 2. Drop old unique constraint
ALTER TABLE public.cuotas
DROP CONSTRAINT IF EXISTS cuotas_grupo_id_tipo_disciplina_id_mes_anio_key;

-- 3. Drop old disciplina_id column
ALTER TABLE public.cuotas
DROP COLUMN IF EXISTS disciplina_id;

-- 4. Create partial unique indexes
-- For 'deportiva' cuotas
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_cuota_deportiva ON public.cuotas (grupo_id, mes, anio, actividad_id)
WHERE tipo = 'deportiva';

-- For 'social' cuotas
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_cuota_social ON public.cuotas (grupo_id, mes, anio)
WHERE tipo = 'social';
