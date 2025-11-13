-- Script para corregir el trigger de autenticación

-- Primero, eliminar el trigger existente si existe
drop trigger if exists on_auth_user_created on auth.users;

-- Crear o reemplazar la función
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, nombre_completo, rol)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'nombre_completo', new.email),
    coalesce(new.raw_user_meta_data->>'rol', 'socio')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Recrear el trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Verificar que la tabla profiles existe y tiene los datos correctos
select id, email, nombre_completo, rol from public.profiles limit 10;
