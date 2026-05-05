-- MultiStock: roles globales en perfiles y plan de cuenta.
-- Mantiene compatibilidad con subscription_plan por negocio.

alter table public.profiles
  add column if not exists role text not null default 'user',
  add column if not exists plan text not null default 'free';

alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('admin', 'user'));

alter table public.profiles
  drop constraint if exists profiles_plan_check;

alter table public.profiles
  add constraint profiles_plan_check
  check (plan in ('free', 'pro', 'business'));

create index if not exists idx_profiles_role on public.profiles (role);
create index if not exists idx_profiles_plan on public.profiles (plan);
create index if not exists idx_profiles_created_at on public.profiles (created_at desc);

update public.profiles
set
  role = coalesce(role, 'user'),
  plan = coalesce(plan, 'free');

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role, plan)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    ),
    'user',
    'free'
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name);

  return new;
end;
$$;
