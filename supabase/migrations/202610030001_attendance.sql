begin;

create table public.employees (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 100),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.absences (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete restrict,
  date date not null,
  type text not null check (type in ('paid_leave', 'unpaid_leave')),
  note text check (char_length(note) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint absences_employee_date_unique unique (employee_id, date)
);
create index absences_date_idx on public.absences(date);
create table public.monthly_settings (
  id uuid primary key default gen_random_uuid(),
  month text not null unique check (month ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'),
  standard_workdays numeric not null check (standard_workdays between 0 and 31),
  paid_leave_allowance numeric not null default 1 check (paid_leave_allowance between 0 and 31),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create function public.set_attendance_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger employees_updated_at before update on public.employees for each row execute function public.set_attendance_updated_at();
create trigger absences_updated_at before update on public.absences for each row execute function public.set_attendance_updated_at();
create trigger monthly_settings_updated_at before update on public.monthly_settings for each row execute function public.set_attendance_updated_at();

alter table public.employees enable row level security;
alter table public.absences enable row level security;
alter table public.monthly_settings enable row level security;

-- DEVELOPMENT ONLY: anonymous and authenticated clients can read/write all data.
-- Anyone with the public project credentials can access these tables.
-- Before using real employee data or deploying to production, remove these policies
-- and replace them with Supabase Auth policies scoped to authorized managers.
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.employees, public.absences, public.monthly_settings to anon, authenticated;
create policy development_employees_all on public.employees for all to anon, authenticated using (true) with check (true);
create policy development_absences_all on public.absences for all to anon, authenticated using (true) with check (true);
create policy development_monthly_settings_all on public.monthly_settings for all to anon, authenticated using (true) with check (true);
commit;
