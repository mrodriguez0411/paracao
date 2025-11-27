-- Este script revierte los cambios de RLS para solucionar un problema de recursión.

-- Deshabilitar RLS en las tablas afectadas para restaurar el acceso.
ALTER TABLE public.disciplinas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_disciplinas DISABLE ROW LEVEL SECURITY;

-- Eliminar las políticas que causaron el problema.
DROP POLICY IF EXISTS "Super admins pueden gestionar disciplinas" ON public.disciplinas;
DROP POLICY IF EXISTS "Super admins tienen acceso total a admin_disciplinas" ON public.admin_disciplinas;
