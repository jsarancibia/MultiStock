-- MultiStock: simplificar roles de negocio a solo owner + employee
-- ================================================================
-- Antes: owner, admin, employee, employee_limited, employee_viewer, staff
-- Después: owner, employee
--
-- admin → owner (nunca se usa realmente, confunde con admin global)
-- employee_limited → employee
-- employee_viewer → employee
-- staff → employee

do $$
begin
  if exists (select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'business_users')
  then
    -- admin → owner
    update public.business_users
    set role = 'owner'
    where role = 'admin';

    -- employee_limited → employee
    update public.business_users
    set role = 'employee'
    where role = 'employee_limited';

    -- employee_viewer → employee
    update public.business_users
    set role = 'employee'
    where role = 'employee_viewer';

    -- staff → employee (legacy, de migraciones anteriores)
    update public.business_users
    set role = 'employee'
    where role = 'staff';

    -- Reemplazar constraint a solo dos roles
    alter table public.business_users
      drop constraint if exists business_users_role_check;

    alter table public.business_users
      add constraint business_users_role_check
      check (role in ('owner', 'employee'));
  end if;
end $$;
