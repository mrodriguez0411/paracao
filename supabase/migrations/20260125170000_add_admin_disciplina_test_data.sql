-- Agregar administradores de disciplina de prueba si no existen
-- Primero verificamos si hay usuarios con rol admin_disciplina
-- Si no hay, actualizamos algunos usuarios existentes a admin_disciplina

-- Actualizar algunos usuarios existentes a admin_disciplina si no hay admins
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE rol = 'admin_disciplina' LIMIT 1) THEN
        UPDATE public.profiles 
        SET rol = 'admin_disciplina' 
        WHERE rol = 'socio' 
        AND id IN (
            SELECT id FROM public.profiles 
            WHERE rol = 'socio' 
            LIMIT 3
        );
    END IF;
END $$;

-- Asignar disciplinas a los administradores
UPDATE public.disciplinas 
SET admin_id = (SELECT id FROM public.profiles WHERE rol = 'admin_disciplina' LIMIT 1)
WHERE nombre = 'Fútbol' AND admin_id IS NULL;

UPDATE public.disciplinas 
SET admin_id = (SELECT id FROM public.profiles WHERE rol = 'admin_disciplina' OFFSET 1 LIMIT 1)
WHERE nombre = 'Básquetbol' AND admin_id IS NULL;

UPDATE public.disciplinas 
SET admin_id = (SELECT id FROM public.profiles WHERE rol = 'admin_disciplina' OFFSET 2 LIMIT 1)
WHERE nombre = 'Natación' AND admin_id IS NULL;

-- Verificar los datos
SELECT 'Admins de disciplina:' as info;
SELECT id, email, rol, nombre, apellido FROM public.profiles WHERE rol = 'admin_disciplina' ORDER BY email;

SELECT 'Disciplinas con admin asignado:' as info;
SELECT id, nombre, admin_id FROM public.disciplinas WHERE admin_id IS NOT NULL ORDER BY nombre;
