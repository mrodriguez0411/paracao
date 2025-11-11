-- Crear tabla de perfiles de usuario (extiende auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  nombre_completo text not null,
  telefono text,
  rol text not null check (rol in ('super_admin', 'admin_disciplina', 'socio')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Habilitar RLS en profiles
alter table public.profiles enable row level security;

-- Políticas para profiles
create policy "Los usuarios pueden ver su propio perfil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Super admins pueden ver todos los perfiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and rol = 'super_admin'
    )
  );

create policy "Admins de disciplina pueden ver perfiles de sus socios"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and rol = 'admin_disciplina'
    )
  );

-- Crear tabla de disciplinas
create table if not exists public.disciplinas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique,
  descripcion text,
  cuota_deportiva decimal(10,2) not null default 0,
  admin_id uuid references public.profiles(id) on delete set null,
  activa boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.disciplinas enable row level security;

create policy "Todos pueden ver disciplinas activas"
  on public.disciplinas for select
  using (activa = true);

create policy "Super admins pueden gestionar disciplinas"
  on public.disciplinas for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and rol = 'super_admin'
    )
  );

-- Crear tabla de grupos familiares
create table if not exists public.grupos_familiares (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  titular_id uuid not null references public.profiles(id) on delete cascade,
  cuota_social decimal(10,2) not null default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.grupos_familiares enable row level security;

create policy "Socios pueden ver su propio grupo familiar"
  on public.grupos_familiares for select
  using (
    titular_id = auth.uid() or
    exists (
      select 1 from public.miembros_familia
      where grupo_id = id and socio_id = auth.uid()
    )
  );

create policy "Admins pueden ver todos los grupos"
  on public.grupos_familiares for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and rol in ('super_admin', 'admin_disciplina')
    )
  );

create policy "Super admins pueden gestionar grupos"
  on public.grupos_familiares for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and rol = 'super_admin'
    )
  );

-- Crear tabla de miembros de familia
create table if not exists public.miembros_familia (
  id uuid primary key default gen_random_uuid(),
  grupo_id uuid not null references public.grupos_familiares(id) on delete cascade,
  socio_id uuid references public.profiles(id) on delete cascade,
  nombre_completo text not null,
  dni text,
  fecha_nacimiento date,
  parentesco text,
  created_at timestamp with time zone default now()
);

alter table public.miembros_familia enable row level security;

create policy "Miembros pueden ver su grupo familiar"
  on public.miembros_familia for select
  using (
    socio_id = auth.uid() or
    exists (
      select 1 from public.grupos_familiares
      where id = grupo_id and titular_id = auth.uid()
    )
  );

create policy "Admins pueden ver todos los miembros"
  on public.miembros_familia for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and rol in ('super_admin', 'admin_disciplina')
    )
  );

create policy "Super admins pueden gestionar miembros"
  on public.miembros_familia for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and rol = 'super_admin'
    )
  );

-- Crear tabla de inscripciones a disciplinas
create table if not exists public.inscripciones (
  id uuid primary key default gen_random_uuid(),
  miembro_id uuid not null references public.miembros_familia(id) on delete cascade,
  disciplina_id uuid not null references public.disciplinas(id) on delete cascade,
  fecha_inscripcion timestamp with time zone default now(),
  activa boolean default true,
  created_at timestamp with time zone default now(),
  unique(miembro_id, disciplina_id)
);

alter table public.inscripciones enable row level security;

create policy "Miembros pueden ver sus inscripciones"
  on public.inscripciones for select
  using (
    exists (
      select 1 from public.miembros_familia mf
      join public.grupos_familiares gf on gf.id = mf.grupo_id
      where mf.id = miembro_id and (gf.titular_id = auth.uid() or mf.socio_id = auth.uid())
    )
  );

create policy "Admins pueden ver inscripciones"
  on public.inscripciones for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and rol in ('super_admin', 'admin_disciplina')
    )
  );

create policy "Super admins pueden gestionar inscripciones"
  on public.inscripciones for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and rol = 'super_admin'
    )
  );

-- Crear tabla de cuotas (registros de pago)
create table if not exists public.cuotas (
  id uuid primary key default gen_random_uuid(),
  grupo_id uuid not null references public.grupos_familiares(id) on delete cascade,
  tipo text not null check (tipo in ('social', 'deportiva')),
  disciplina_id uuid references public.disciplinas(id) on delete set null,
  mes integer not null check (mes between 1 and 12),
  anio integer not null,
  monto decimal(10,2) not null,
  fecha_vencimiento date not null,
  fecha_pago timestamp with time zone,
  metodo_pago text check (metodo_pago in ('efectivo', 'transferencia', 'online')),
  pagada boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(grupo_id, tipo, disciplina_id, mes, anio)
);

alter table public.cuotas enable row level security;

create policy "Socios pueden ver cuotas de su grupo"
  on public.cuotas for select
  using (
    exists (
      select 1 from public.grupos_familiares
      where id = grupo_id and titular_id = auth.uid()
    ) or
    exists (
      select 1 from public.miembros_familia
      where grupo_id = cuotas.grupo_id and socio_id = auth.uid()
    )
  );

create policy "Admins pueden ver todas las cuotas"
  on public.cuotas for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and rol in ('super_admin', 'admin_disciplina')
    )
  );

create policy "Super admins pueden gestionar cuotas"
  on public.cuotas for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and rol = 'super_admin'
    )
  );

-- Crear índices para mejorar el rendimiento
create index if not exists idx_profiles_rol on public.profiles(rol);
create index if not exists idx_disciplinas_activa on public.disciplinas(activa);
create index if not exists idx_grupos_titular on public.grupos_familiares(titular_id);
create index if not exists idx_miembros_grupo on public.miembros_familia(grupo_id);
create index if not exists idx_inscripciones_miembro on public.inscripciones(miembro_id);
create index if not exists idx_inscripciones_disciplina on public.inscripciones(disciplina_id);
create index if not exists idx_cuotas_grupo on public.cuotas(grupo_id);
create index if not exists idx_cuotas_fecha on public.cuotas(mes, anio);
