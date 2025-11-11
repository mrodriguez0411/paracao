-- Nota: Este script debe ejecutarse DESPUÉS de que el super admin se haya registrado
-- El email debe coincidir con el email del super admin que se registró

-- Actualizar el primer usuario registrado como super admin
-- IMPORTANTE: Cambiar 'admin@clubdeportivo.com' por el email real del super admin
update public.profiles
set rol = 'super_admin',
    nombre_completo = 'Administrador Principal'
where email = 'admin@clubdeportivo.com';

-- Si ya tienes el UUID del usuario, puedes usar:
-- update public.profiles set rol = 'super_admin' where id = 'UUID_DEL_USUARIO';
