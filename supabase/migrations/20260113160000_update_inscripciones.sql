-- 1. Add actividad_id column to inscripciones, nullable for now
ALTER TABLE public.inscripciones
ADD COLUMN actividad_id UUID REFERENCES public.actividades(id) ON DELETE CASCADE;

-- 2. Drop the old unique constraint and foreign key constraint
ALTER TABLE public.inscripciones
DROP CONSTRAINT IF EXISTS inscripciones_miembro_id_disciplina_id_key,
DROP CONSTRAINT IF EXISTS inscripciones_disciplina_id_fkey;

-- 3. Drop the disciplina_id column
ALTER TABLE public.inscripciones
DROP COLUMN IF EXISTS disciplina_id;

-- 4. Make actividad_id non-nullable and add a new unique constraint
ALTER TABLE public.inscripciones
ALTER COLUMN actividad_id SET NOT NULL;

ALTER TABLE public.inscripciones
ADD CONSTRAINT inscripciones_miembro_id_actividad_id_key UNIQUE (miembro_id, actividad_id);

-- 5. Update RLS policies for inscripciones
DROP POLICY IF EXISTS "Admins pueden ver inscripciones" ON public.inscripciones;
DROP POLICY IF EXISTS "Super admins pueden gestionar inscripciones" ON public.inscripciones;

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
