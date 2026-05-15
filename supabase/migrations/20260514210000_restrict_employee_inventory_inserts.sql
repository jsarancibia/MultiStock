-- MultiStock: reforzar que employee NO puede INSERT/UPDATE/DELETE en productos
-- ni en movimientos de stock (solo SELECT).
-- ===========================================================================
-- Aunque las migraciones anteriores ya establecen policies restrictivas,
-- esta migración las reafirma explícitamente y garantiza que:
--
--   employee  →  SELECT  ✅
--   employee  →  INSERT  ❌  products, stock_movements, categories, suppliers
--   employee  →  UPDATE  ❌  products, stock_movements, categories, suppliers
--   employee  →  DELETE  ❌  products, stock_movements, categories, suppliers
--
-- owner puede hacer todas las operaciones (INSERT, SELECT, UPDATE, DELETE).
-- ===========================================================================

-- =========================================================================
-- PRODUCTS: employee solo SELECT; owner INSERT / UPDATE / DELETE
-- =========================================================================
do $$
begin
  if exists (select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'products')
  then
    drop policy if exists "Members manage products" on public.products;
    drop policy if exists "Members can view products" on public.products;
    drop policy if exists "Admin can insert products" on public.products;
    drop policy if exists "Admin can update products" on public.products;
    drop policy if exists "Admin can delete products" on public.products;

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
  end if;
end $$;

-- =========================================================================
-- STOCK_MOVEMENTS: employee solo SELECT; owner INSERT / UPDATE / DELETE
-- =========================================================================
do $$
begin
  if exists (select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'stock_movements')
  then
    drop policy if exists "Members manage stock_movements" on public.stock_movements;
    drop policy if exists "Members can view stock_movements" on public.stock_movements;
    drop policy if exists "Admin can insert stock_movements" on public.stock_movements;
    drop policy if exists "Admin can update stock_movements" on public.stock_movements;
    drop policy if exists "Admin can delete stock_movements" on public.stock_movements;

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
  end if;
end $$;

-- =========================================================================
-- CATEGORIES: employee solo SELECT; owner INSERT / UPDATE / DELETE
-- =========================================================================
do $$
begin
  if exists (select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'categories')
  then
    drop policy if exists "Members manage categories" on public.categories;
    drop policy if exists "Members can view categories" on public.categories;
    drop policy if exists "Admin can insert categories" on public.categories;
    drop policy if exists "Admin can update categories" on public.categories;
    drop policy if exists "Admin can delete categories" on public.categories;

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
  end if;
end $$;

-- =========================================================================
-- SUPPLIERS: employee solo SELECT; owner INSERT / UPDATE / DELETE
-- =========================================================================
do $$
begin
  if exists (select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'suppliers')
  then
    drop policy if exists "Members manage suppliers" on public.suppliers;
    drop policy if exists "Members can view suppliers" on public.suppliers;
    drop policy if exists "Admin can insert suppliers" on public.suppliers;
    drop policy if exists "Admin can update suppliers" on public.suppliers;
    drop policy if exists "Admin can delete suppliers" on public.suppliers;

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
  end if;
end $$;
