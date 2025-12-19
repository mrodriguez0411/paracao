-- Habilitar RLS para la tabla de inscripciones si aún no está hecho
ALTER TABLE public.inscripciones ENABLE ROW LEVEL SECURITY;

-- Eliminar política antigua para evitar conflictos
DROP POLICY IF EXISTS "Los administradores de disciplina pueden ver las inscripciones de su disciplina" ON public.inscripciones;

-- Crear la política de SELECCIÓN (SELECT)
-- Esta política permite a un 'admin_disciplina' ver las filas de la tabla 'inscripciones'
-- que corresponden a la disciplina que administra.
CREATE POLICY "Los administradores de disciplina pueden ver las inscripciones de su disciplina"
  ON public.inscripciones
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.disciplinas d
      WHERE
        d.id = inscripciones.disciplina_id AND d.admin_id = auth.uid()
    )
  );
