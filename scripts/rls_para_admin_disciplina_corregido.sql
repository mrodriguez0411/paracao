-- Habilitar RLS para las tablas si aún no está hecho
ALTER TABLE public.miembros_familia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inscripciones ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas antiguas para evitar duplicados o conflictos
DROP POLICY IF EXISTS "Los administradores de disciplina pueden ver a los miembros de su disciplina" ON public.miembros_familia;
DROP POLICY IF EXISTS "Los administradores de disciplina pueden ver las inscripciones de su disciplina" ON public.inscripciones;

-- Política para que los administradores de disciplina puedan ver a los miembros de su disciplina
CREATE POLICY "Los administradores de disciplina pueden ver a los miembros de su disciplina"
  ON public.miembros_familia
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.inscripciones i
      JOIN public.disciplinas d ON i.disciplina_id = d.id
      WHERE i.miembro_id = public.miembros_familia.id AND d.admin_id = auth.uid()
    )
  );

-- Política para que los administradores de disciplina puedan ver las inscripciones de su disciplina
CREATE POLICY "Los administradores de disciplina pueden ver las inscripciones de su disciplina"
    ON public.inscripciones
    FOR SELECT
    USING (
        disciplina_id IN (
            SELECT id
            FROM public.disciplinas
            WHERE admin_id = auth.uid()
        )
    );
