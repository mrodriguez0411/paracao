DO $$
BEGIN
  IF NOT EXISTS(SELECT * FROM information_schema.columns WHERE table_name='inscripciones' AND column_name='actividad_id') THEN
    ALTER TABLE public.inscripciones
    ADD COLUMN actividad_id UUID REFERENCES public.actividades(id) ON DELETE SET NULL;
  END IF;
END;
$$;
