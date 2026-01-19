CREATE TABLE public.actividades (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    nombre character varying NOT NULL,
    disciplina_id uuid NOT NULL,
    precio numeric NOT NULL,
    CONSTRAINT actividades_pkey PRIMARY KEY (id),
    CONSTRAINT actividades_disciplina_id_fkey FOREIGN KEY (disciplina_id) REFERENCES public.disciplinas(id) ON DELETE CASCADE
);

ALTER TABLE public.actividades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios autenticados pueden ver las actividades"
ON public.actividades
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Los administradores pueden gestionar las actividades"
ON public.actividades
FOR ALL
USING (public.get_user_role() IN ('super_admin'));