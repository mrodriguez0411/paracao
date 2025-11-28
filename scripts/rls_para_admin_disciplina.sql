-- Habilitar RLS para la tabla de miembros si aún no está hecho
ALTER TABLE public.miembros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.miembros_disciplinas ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas antiguas para evitar duplicados o conflictos
DROP POLICY IF EXISTS "Los administradores de disciplina pueden ver a los miembros de su disciplina" ON public.miembros;
DROP POLICY IF EXISTS "Los administradores de disciplina pueden ver las relaciones miembro-disciplina de su disciplina" ON public.miembros_disciplinas;

-- Política para que los administradores de disciplina puedan ver a los miembros de su disciplina
CREATE POLICY "Los administradores de disciplina pueden ver a los miembros de su disciplina"
  ON public.miembros
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.miembros_disciplinas md
      JOIN public.disciplinas d ON md.disciplina_id = d.id
      WHERE md.miembro_id = id AND d.admin_id = auth.uid()
    )
  );

-- Política para que los administradores de disciplina puedan ver las relaciones miembro-disciplina de su disciplina
CREATE POLICY "Los administradores de disciplina pueden ver las relaciones miembro-disciplina de su disciplina"
    ON public.miembros_disciplinas
    FOR SELECT
    USING (
        disciplina_id IN (
            SELECT id
            FROM public.disciplinas
            WHERE admin_id = auth.uid()
        )
    );
