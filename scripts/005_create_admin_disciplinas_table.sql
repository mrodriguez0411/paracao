-- Crear tabla de admin_disciplinas
create table if not exists public.admin_disciplinas (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.profiles(id) on delete cascade,
  disciplina_id uuid not null references public.disciplinas(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique(admin_id, disciplina_id)
);

-- Habilitar RLS en admin_disciplinas
alter table public.admin_disciplinas enable row level security;

-- Políticas para admin_disciplinas
create policy "Super admins pueden gestionar la tabla"
  on public.admin_disciplinas for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and rol = 'super_admin'
    )
  );

create policy "Admins de disciplina pueden ver sus propias asignaciones"
    on public.admin_disciplinas for select
    using (admin_id = auth.uid());