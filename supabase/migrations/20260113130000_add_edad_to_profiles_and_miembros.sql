alter table public.profiles
add column edad int4 generated always as (calculate_age(fecha_nacimiento)) stored;

alter table public.miembros_familia
add column edad int4 generated always as (calculate_age(fecha_nacimiento)) stored;
