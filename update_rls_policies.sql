-- =================================================================
--  SCRIPT DE ACTUALIZACIÓN DE POLÍTICAS DE SEGURIDAD (RLS)
--  Tabla: miembros_familia
-- =================================================================
--
--  Instrucciones:
--  1. Vaya al Editor de SQL en su proyecto de Supabase.
--  2. Copie y pegue TODO el contenido de este archivo en el editor.
--  3. Haga clic en "RUN" para ejecutarlo.
--
--  Este script hará lo siguiente:
--  - Eliminará las políticas de SELECT anteriores en la tabla 'miembros_familia'.
--  - Creará nuevas políticas corregidas que aseguran que:
--      - Los 'super_admin' puedan ver a TODOS los miembros.
--      - Los 'admin_disciplina' puedan ver ÚNICAMENTE a los miembros
--        inscritos en la disciplina que administran.
--
-- =================================================================

-- PASO 1: Eliminar políticas de SELECT anteriores para evitar conflictos.
-- No se preocupe si recibe un error indicando que una política no existe.

DROP POLICY IF EXISTS "Permitir a los administradores de disciplina ver a sus miembros" ON public.miembros_familia;
DROP POLICY IF EXISTS "Permitir a los super_admins ver todos los miembros" ON public.miembros_familia;
DROP POLICY IF EXISTS "Enable read access for admin_disciplina" ON public.miembros_familia;
DROP POLICY IF EXISTS "Enable read access for super_admin" ON public.miembros_familia;
DROP POLICY IF EXISTS "Enable read access for super_admins to all members" ON public.miembros_familia;
DROP POLICY IF EXISTS "Enable read access for admin_disciplina to their members" ON public.miembros_familia;
DROP POLICY IF EXISTS "super_admins_pueden_ver_todos_los_miembros" ON public.miembros_familia;
DROP POLICY IF EXISTS "admin_disciplina_puede_ver_miembros_de_su_disciplina" ON public.miembros_familia;


-- PASO 2: Crear la nueva política para los super administradores.
-- Permite a los 'super_admin' ver todos los registros de 'miembros_familia'.

CREATE POLICY "super_admins_pueden_ver_todos_los_miembros"
ON public.miembros_familia
FOR SELECT
TO super_admin
USING (true);


-- PASO 3: Crear la nueva política para los administradores de disciplina.
-- Permite a un 'admin_disciplina' ver solo los miembros inscritos en su disciplina.

CREATE POLICY "admin_disciplina_puede_ver_miembros_de_su_disciplina"
ON public.miembros_familia
FOR SELECT
TO admin_disciplina
USING (
  EXISTS (
    SELECT 1
    FROM
      public.disciplinas d
    JOIN
      public.inscripciones i ON d.id = i.disciplina_id
    WHERE
      d.admin_id = auth.uid() AND i.miembro_id = public.miembros_familia.id
  )
);

-- =================================================================
--  Fin del script.
-- =================================================================
