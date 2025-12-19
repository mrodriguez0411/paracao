-- =================================================================
--  SCRIPT DE CREACIÓN DE POLÍTICAS DE SEGURIDAD (RLS) - ¡ESTA ES LA SOLUCIÓN!
--  Tabla: inscripciones
-- =================================================================
--
--  Instrucciones:
--  1. Vaya al Editor de SQL en su proyecto de Supabase.
--  2. Copie y pegue TODO el contenido de este archivo en el editor.
--  3. Haga clic en "RUN" para ejecutarlo.
--
--  Este script hará lo siguiente:
--  - Se asegurará de que RLS esté habilitado en la tabla 'inscripciones'.
--  - Eliminará cualquier política de SELECT preexistente para evitar conflictos.
--  - Creará la política de seguridad que falta para permitir a los 'admin_disciplina'
--    leer ÚNICAMENTE las inscripciones de la disciplina que administran.
--  - Añadirá una política para que los 'super_admin' puedan leer todas las inscripciones.
--
-- =================================================================

-- PASO 1: Asegurarse de que RLS está habilitado en la tabla 'inscripciones'.
ALTER TABLE public.inscripciones ENABLE ROW LEVEL SECURITY;

-- PASO 2: Eliminar políticas de SELECT existentes para una instalación limpia.
DROP POLICY IF EXISTS "Permitir a los admins de disciplina leer las inscripciones" ON public.inscripciones;
DROP POLICY IF EXISTS "Permitir a los super_admins leer todas las inscripciones" ON public.inscripciones;


-- PASO 3: Crear la política clave para administradores de disciplina.
-- Esta política permite a un 'admin_disciplina' ver las filas de 'inscripciones'
-- si la 'disciplina_id' de la inscripción coincide con la que el admin gestiona.
CREATE POLICY "Permitir a los admins de disciplina leer las inscripciones"
ON public.inscripciones
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.admin_disciplinas ad
    WHERE ad.admin_id = auth.uid() AND ad.disciplina_id = inscripciones.disciplina_id
  )
);

-- PASO 4: Crear política para super administradores para asegurar que siempre tengan acceso.
CREATE POLICY "Permitir a los super_admins leer todas las inscripciones"
ON public.inscripciones
FOR SELECT
USING (
  (get_user_role() = 'super_admin')
);

-- FIN DEL SCRIPT --
