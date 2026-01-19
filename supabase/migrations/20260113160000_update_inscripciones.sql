-- 1. Add actividad_id column to inscripciones, nullable for now
DO $$
BEGIN
  IF NOT EXISTS(SELECT * FROM information_schema.columns WHERE table_name='inscripciones' AND column_name='actividad_id') THEN
    ALTER TABLE public.inscripciones
    ADD COLUMN actividad_id UUID REFERENCES public.actividades(id) ON DELETE CASCADE;
  END IF;
END;
$$;

-- 2. Drop RLS policies that depend on the old `disciplina_id` column

-- Policies on inscripciones table
DROP POLICY IF EXISTS "Admins pueden ver inscripciones" ON public.inscripciones;
DROP POLICY IF EXISTS "Super admins pueden gestionar inscripciones" ON public.inscripciones;
DROP POLICY IF EXISTS "Admins can view inscriptions of their assigned disciplines" ON public.inscripciones;
DROP POLICY IF EXISTS "Permitir a los admins de disciplina leer las inscripciones" ON public.inscripciones;
DROP POLICY IF EXISTS "Los administradores de disciplina pueden ver las inscripciones" ON public.inscripciones;
DROP POLICY IF EXISTS "Los administradores de disciplina pueden ver las inscripciones " ON public.inscripciones; -- From error log
DROP POLICY IF EXISTS "admin_disciplina_select_inscripciones" ON public.inscripciones;

-- Policies on miembros_familia table
DROP POLICY IF EXISTS "Los administradores de disciplina pueden ver a los miembros de" ON public.miembros_familia;
DROP POLICY IF EXISTS "Los administradores de disciplina pueden ver a los miembros de " ON public.miembros_familia; -- From error log

-- 3. Drop the old unique constraint and foreign key constraint on `disciplina_id`
ALTER TABLE public.inscripciones
DROP CONSTRAINT IF EXISTS inscripciones_miembro_id_disciplina_id_key,
DROP CONSTRAINT IF EXISTS inscripciones_disciplina_id_fkey;

-- 4. Drop the disciplina_id column
ALTER TABLE public.inscripciones
DROP COLUMN IF EXISTS disciplina_id;

-- 5. Add a new unique constraint. The NOT NULL constraint will be added in a later migration.
ALTER TABLE public.inscripciones
ADD CONSTRAINT inscripciones_miembro_id_actividad_id_key UNIQUE (miembro_id, actividad_id);

-- 6. Update RLS policies for inscripciones to use `actividad_id`
DROP POLICY IF EXISTS "Super admins pueden gestionar todo" ON public.inscripciones;
DROP POLICY IF EXISTS "Admin disciplina puede gestionar sus inscripciones" ON public.inscripciones;

CREATE POLICY "Super admins pueden gestionar todo" ON public.inscripciones FOR ALL
USING ( (SELECT rol FROM public.profiles WHERE id = auth.uid()) = 'super_admin' )
WITH CHECK ( (SELECT rol FROM public.profiles WHERE id = auth.uid()) = 'super_admin' );

CREATE POLICY "Admin disciplina puede gestionar sus inscripciones" ON public.inscripciones FOR ALL
USING (
    (SELECT rol FROM public.profiles WHERE id = auth.uid()) = 'admin_disciplina'
    AND
    actividad_id IN (
        SELECT a.id
        FROM public.actividades a
        JOIN public.disciplinas d ON a.disciplina_id = d.id
        WHERE d.admin_id = auth.uid()
    )
)
WITH CHECK (
    (SELECT rol FROM public.profiles WHERE id = auth.uid()) = 'admin_disciplina'
    AND
    actividad_id IN (
        SELECT a.id
        FROM public.actividades a
        JOIN public.disciplinas d ON a.disciplina_id = d.id
        WHERE d.admin_id = auth.uid()
    )
);
