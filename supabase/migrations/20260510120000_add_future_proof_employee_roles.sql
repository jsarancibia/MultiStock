-- MultiStock FASE 1: Roles (Admin, Dueño, Empleado)
-- ====================================================
-- 1) Renombrar staff → employee + constraint futuro-proof
-- 2) RPC get_business_role()
-- 3) RLS restrictivas para employee

-- ====================================================
-- 1.1) Renombrar 'staff' → 'employee'
-- ====================================================
update public.business_users
set role = 'employee'
where role = 'staff';

-- ====================================================
-- 1.2) Reemplazar constraint con roles futuro-proof
-- ====================================================
alter table public.business_users
  drop constraint if exists business_users_role_check;

alter table public.business_users
  add constraint business_users_role_check
  check (role in (
    'owner',
    'admin',
    'employee',
    'employee_limited',
    'employee_viewer'
  ));

-- ====================================================
-- 1.3) RPC get_business_role() para server actions
-- ====================================================
create or replace function public.get_business_role(p_business_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select bu.role
      from public.business_users bu
      where bu.business_id = p_business_id
        and bu.user_id = (select auth.uid())
    ),
    (
      select case
        when b.owner_id = (select auth.uid()) then 'owner'::text
        else null
      end
      from public.businesses b
      where b.id = p_business_id
    )
  );
$$;

grant execute on function public.get_business_role(uuid) to authenticated;

-- ====================================================
-- 1.4) RLS: Products — employee solo SELECT
-- ====================================================
drop policy if exists "Members manage products" on public.products;

create policy "Members can view products"
  on public.products for select
  to authenticated
  using (public.is_business_member(business_id));

create policy "Admin can insert products"
  on public.products for insert
  to authenticated
  with check (public.is_business_admin(business_id));

create policy "Admin can update products"
  on public.products for update
  to authenticated
  using (public.is_business_admin(business_id));

create policy "Admin can delete products"
  on public.products for delete
  to authenticated
  using (public.is_business_admin(business_id));

-- ====================================================
-- 1.5) RLS: Categories — employee solo SELECT
-- ====================================================
drop policy if exists "Members manage categories" on public.categories;

create policy "Members can view categories"
  on public.categories for select
  to authenticated
  using (public.is_business_member(business_id));

create policy "Admin can insert categories"
  on public.categories for insert
  to authenticated
  with check (public.is_business_admin(business_id));

create policy "Admin can update categories"
  on public.categories for update
  to authenticated
  using (public.is_business_admin(business_id));

create policy "Admin can delete categories"
  on public.categories for delete
  to authenticated
  using (public.is_business_admin(business_id));

-- ====================================================
-- 1.6) RLS: Suppliers — employee solo SELECT
-- ====================================================
drop policy if exists "Members manage suppliers" on public.suppliers;

create policy "Members can view suppliers"
  on public.suppliers for select
  to authenticated
  using (public.is_business_member(business_id));

create policy "Admin can insert suppliers"
  on public.suppliers for insert
  to authenticated
  with check (public.is_business_admin(business_id));

create policy "Admin can update suppliers"
  on public.suppliers for update
  to authenticated
  using (public.is_business_admin(business_id));

create policy "Admin can delete suppliers"
  on public.suppliers for delete
  to authenticated
  using (public.is_business_admin(business_id));

-- ====================================================
-- 1.7) RLS: Stock movements — employee solo SELECT
--      (INSERT por venta usa create_sale_with_items con security definer)
-- ====================================================
drop policy if exists "Members manage stock_movements" on public.stock_movements;

create policy "Members can view stock_movements"
  on public.stock_movements for select
  to authenticated
  using (public.is_business_member(business_id));

create policy "Admin can insert stock_movements"
  on public.stock_movements for insert
  to authenticated
  with check (public.is_business_admin(business_id));

create policy "Admin can update stock_movements"
  on public.stock_movements for update
  to authenticated
  using (public.is_business_admin(business_id));

create policy "Admin can delete stock_movements"
  on public.stock_movements for delete
  to authenticated
  using (public.is_business_admin(business_id));

-- ====================================================
-- 1.8) RLS: Sales — employee puede SELECT e INSERT (crear venta), no UPDATE/DELETE
-- ====================================================
drop policy if exists "Members manage sales" on public.sales;

create policy "Members can view sales"
  on public.sales for select
  to authenticated
  using (public.is_business_member(business_id));

create policy "Members can insert sales"
  on public.sales for insert
  to authenticated
  with check (public.is_business_member(business_id));

create policy "Admin can update sales"
  on public.sales for update
  to authenticated
  using (public.is_business_admin(business_id));

create policy "Admin can delete sales"
  on public.sales for delete
  to authenticated
  using (public.is_business_admin(business_id));

-- ====================================================
-- 1.9) RLS: Sale_items — employee puede SELECT e INSERT
-- ====================================================
drop policy if exists "Members manage sale_items" on public.sale_items;

create policy "Members can view sale_items"
  on public.sale_items for select
  to authenticated
  using (
    exists (
      select 1 from public.sales s
      where s.id = sale_id
        and public.is_business_member(s.business_id)
    )
  );

create policy "Members can insert sale_items"
  on public.sale_items for insert
  to authenticated
  with check (
    exists (
      select 1 from public.sales s
      where s.id = sale_id
        and public.is_business_member(s.business_id)
    )
  );

create policy "Admin can update sale_items"
  on public.sale_items for update
  to authenticated
  using (
    exists (
      select 1 from public.sales s
      where s.id = sale_id
        and public.is_business_admin(s.business_id)
    )
  );

create policy "Admin can delete sale_items"
  on public.sale_items for delete
  to authenticated
  using (
    exists (
      select 1 from public.sales s
      where s.id = sale_id
        and public.is_business_admin(s.business_id)
    )
  );

-- ====================================================
-- 1.10) RLS: Audit logs — employee no puede SELECT (INSERT para todos se mantiene)
-- ====================================================
-- La policy actual "Members can view audit logs" usa is_business_member.
-- La reemplazamos por is_business_admin para que employee no vea auditoría.
drop policy if exists "Members can view audit logs" on public.audit_logs;

create policy "Admin can view audit logs"
  on public.audit_logs for select
  to authenticated
  using (public.is_business_admin(business_id));

-- INSERT policy se mantiene (todos pueden registrar eventos)
-- ya existe "Members can insert audit logs" con is_business_member
