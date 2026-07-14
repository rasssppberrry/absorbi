-- Absorbi initial schema
-- Run this once in the Supabase SQL Editor.

create extension if not exists pgcrypto with schema extensions;

-- 1. Reference tables --------------------------------------------------

create table if not exists public.cities (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.hospitals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city_id uuid not null references public.cities(id),
  created_at timestamptz not null default now()
);

create table if not exists public.hospital_secrets (
  hospital_id uuid primary key references public.hospitals(id) on delete cascade,
  access_code_hash text not null
);

-- 2. People ------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  hospital_id uuid not null references public.hospitals(id),
  full_name text not null,
  email text not null,
  role text not null default 'clinician',
  created_at timestamptz not null default now()
);

-- 3. Clinical data -----------------------------------------------------

create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  hospital_id uuid not null references public.hospitals(id),
  mrn_hash text,
  sex text,
  birth_year int,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.studies (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  hospital_id uuid not null references public.hospitals(id),
  modality text not null default 'MRI',
  storage_prefix text,
  clinical_form jsonb not null default '{}'::jsonb,
  status text not null default 'draft',
  uploaded_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.predictions (
  id uuid primary key default gen_random_uuid(),
  study_id uuid not null references public.studies(id) on delete cascade,
  model_version text not null default 'rules-v0',
  backend text not null default 'mock',
  red_flag_band text,
  red_flag_factors jsonb not null default '[]'::jsonb,
  resorption_prob numeric,
  resorption_band text,
  trajectory jsonb not null default '[]'::jsonb,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.signoffs (
  id uuid primary key default gen_random_uuid(),
  prediction_id uuid not null references public.predictions(id) on delete cascade,
  clinician_id uuid not null references public.profiles(id),
  decision text not null,
  note text,
  signed_at timestamptz not null default now()
);

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  hospital_id uuid,
  action text not null,
  entity text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- 4. Helper functions --------------------------------------------------

create or replace function public.current_hospital_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select hospital_id from public.profiles where id = auth.uid();
$$;

create or replace function public.verify_hospital_code(p_hospital_id uuid, p_code text)
returns boolean
language sql
stable
security definer
set search_path = public, extensions
as $$
  select exists (
    select 1 from public.hospital_secrets s
    where s.hospital_id = p_hospital_id
      and s.access_code_hash = extensions.crypt(p_code, s.access_code_hash)
  );
$$;

grant execute on function public.verify_hospital_code(uuid, text) to anon, authenticated;
grant execute on function public.current_hospital_id() to authenticated;

-- 5. Row Level Security ------------------------------------------------

alter table public.cities enable row level security;
alter table public.hospitals enable row level security;
alter table public.hospital_secrets enable row level security;
alter table public.profiles enable row level security;
alter table public.patients enable row level security;
alter table public.studies enable row level security;
alter table public.predictions enable row level security;
alter table public.signoffs enable row level security;
alter table public.audit_log enable row level security;

create policy "cities readable by everyone"
  on public.cities for select to anon, authenticated using (true);

create policy "hospitals readable by everyone"
  on public.hospitals for select to anon, authenticated using (true);

-- hospital_secrets: no policy, so no one can read it except the security
-- definer function above and the trusted server side service_role key.

create policy "read own profile"
  on public.profiles for select to authenticated using (id = auth.uid());

create policy "update own profile"
  on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

create policy "read patients in my hospital"
  on public.patients for select to authenticated
  using (hospital_id = public.current_hospital_id());

create policy "insert patients in my hospital"
  on public.patients for insert to authenticated
  with check (hospital_id = public.current_hospital_id());

create policy "read studies in my hospital"
  on public.studies for select to authenticated
  using (hospital_id = public.current_hospital_id());

create policy "insert studies in my hospital"
  on public.studies for insert to authenticated
  with check (hospital_id = public.current_hospital_id());

create policy "update studies in my hospital"
  on public.studies for update to authenticated
  using (hospital_id = public.current_hospital_id())
  with check (hospital_id = public.current_hospital_id());

create policy "read predictions in my hospital"
  on public.predictions for select to authenticated
  using (exists (
    select 1 from public.studies s
    where s.id = predictions.study_id
      and s.hospital_id = public.current_hospital_id()
  ));

create policy "insert predictions in my hospital"
  on public.predictions for insert to authenticated
  with check (exists (
    select 1 from public.studies s
    where s.id = predictions.study_id
      and s.hospital_id = public.current_hospital_id()
  ));

create policy "update predictions in my hospital"
  on public.predictions for update to authenticated
  using (exists (
    select 1 from public.studies s
    where s.id = predictions.study_id
      and s.hospital_id = public.current_hospital_id()
  ));

create policy "read signoffs in my hospital"
  on public.signoffs for select to authenticated
  using (exists (
    select 1 from public.predictions p
    join public.studies s on s.id = p.study_id
    where p.id = signoffs.prediction_id
      and s.hospital_id = public.current_hospital_id()
  ));

create policy "insert own signoffs"
  on public.signoffs for insert to authenticated
  with check (
    clinician_id = auth.uid()
    and exists (
      select 1 from public.predictions p
      join public.studies s on s.id = p.study_id
      where p.id = signoffs.prediction_id
        and s.hospital_id = public.current_hospital_id()
    )
  );

create policy "read audit in my hospital"
  on public.audit_log for select to authenticated
  using (hospital_id = public.current_hospital_id());

-- signoffs and audit_log have no update or delete policy, so they are
-- append only for normal users.
revoke update, delete on public.signoffs from anon, authenticated;
revoke update, delete on public.audit_log from anon, authenticated;

-- 6. Seed data ---------------------------------------------------------

insert into public.cities (name) values ('Astana'), ('Almaty'), ('Shymkent')
on conflict (name) do nothing;

insert into public.hospitals (name, city_id)
select v.name, c.id
from (values
  ('National Centre for Neurosurgery', 'Astana'),
  ('University Medical Center', 'Astana'),
  ('Almaty Central Hospital', 'Almaty')
) as v(name, city_name)
join public.cities c on c.name = v.city_name
where not exists (
  select 1 from public.hospitals h where h.name = v.name and h.city_id = c.id
);

insert into public.hospital_secrets (hospital_id, access_code_hash)
select h.id, extensions.crypt(v.code, extensions.gen_salt('bf'))
from public.hospitals h
join (values
  ('National Centre for Neurosurgery', 'NCN-2026'),
  ('University Medical Center', 'UMC-2026'),
  ('Almaty Central Hospital', 'ALM-2026')
) as v(name, code) on v.name = h.name
on conflict (hospital_id) do nothing;
