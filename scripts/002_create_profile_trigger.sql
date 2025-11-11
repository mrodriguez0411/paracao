-- Función para crear perfil automáticamente cuando se registra un usuario
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, nombre_completo, rol)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'nombre_completo', new.email),
    coalesce(new.raw_user_meta_data ->> 'rol', 'socio')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- Trigger que ejecuta la función al crear un nuevo usuario
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
