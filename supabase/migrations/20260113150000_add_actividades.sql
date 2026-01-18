-- Crear tabla de actividades
create table if not exists public.actividades (
  id uuid primary key default gen_random_uuid(),
  disciplina_id uuid not null references public.disciplinas(id) on delete cascade,
  nombre text not null,
  costo decimal(10,2) not null default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(disciplina_id, nombre)
);

-- Habilitar RLS en actividades
alter table public.actividades enable row level security;

-- Políticas para actividades
create policy "Todos pueden ver actividades"
  on public.actividades for select
  using (true);

create policy "Super admins pueden gestionar actividades"
  on public.actividades for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and rol = 'super_admin'
    )
  );

create policy "Admins de disciplina pueden gestionar actividades de su disciplina"
    on public.actividades for all
    using (
        exists (
            select 1 from public.profiles
            where id = auth.uid() and rol = 'admin_disciplina' and exists (
                select 1 from public.disciplinas
                where id = disciplina_id and admin_id = auth.uid()
            )
        )
    );

-- Modificar la tabla de disciplinas para quitar la cuota deportiva
alter table public.disciplinas drop column if exists cuota_deportiva;