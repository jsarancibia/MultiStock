-- MultiStock: core multi-tenant schema (Fase 2 arquitectura1)
-- Run via Supabase SQL Editor or: supabase db push / supabase migration up

-- -----------------------------------------------------------------------------
-- 1) Helpers
-- -----------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- 2) Tables
-- -----------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete restrict,
  name text not null,
  business_type text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint businesses_business_type_check check (
    business_type in ('verduleria', 'almacen', 'ferreteria')
  )
);

create table if not exists public.business_users (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null,
  created_at timestamptz not null default now(),
  constraint business_users_role_check check (role in ('owner', 'admin', 'staff')),
  constraint business_users_business_user_unique unique (business_id, user_id)
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  name text not null,
  business_type text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  name text not null,
  phone text,
  email text,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  category_id uuid references public.categories (id) on delete set null,
  supplier_id uuid references public.suppliers (id) on delete set null,
  name text not null,
  sku text,
  barcode text,
  unit_type text not null,
  cost_price numeric(14, 4) not null default 0,
  sale_price numeric(14, 4) not null default 0,
  min_stock numeric(14, 4) not null default 0,
  current_stock numeric(14, 4) not null default 0,
  business_type text not null,
  metadata jsonb not null default '{}',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_business_type_check check (
    business_type in ('verduleria', 'almacen', 'ferreteria')
  ),
  constraint products_unit_type_check check (
    unit_type in ('unit', 'kg', 'g', 'box', 'liter', 'meter')
  )
);

create table if not exists public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  type text not null,
  quantity numeric(14, 4) not null,
  reason text,
  unit_cost numeric(14, 4),
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint stock_movements_type_check check (
    type in (
      'purchase',
      'sale',
      'adjustment',
      'waste',
      'return',
      'initial_stock'
    )
  )
);

create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  total numeric(14, 4) not null,
  payment_method text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references public.sales (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete restrict,
  quantity numeric(14, 4) not null,
  unit_price numeric(14, 4) not null,
  subtotal numeric(14, 4) not null
);

create table if not exists public.stock_alerts (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  type text not null,
  message text not null,
  resolved boolean not null default false,
  created_at timestamptz not null default now(),
  constraint stock_alerts_type_check check (
    type in ('low_stock', 'out_of_stock', 'perishable_warning', 'waste_warning')
  )
);

-- Consistencia product_id vs business_id: validar en app o con triggers (Fase 2).

-- -----------------------------------------------------------------------------
-- 3) Indexes
-- -----------------------------------------------------------------------------

create index if not exists idx_businesses_owner_id on public.businesses (owner_id);
create index if not exists idx_businesses_business_type on public.businesses (business_type);

create index if not exists idx_business_users_business_id on public.business_users (business_id);
create index if not exists idx_business_users_user_id on public.business_users (user_id);

create index if not exists idx_categories_business_id on public.categories (business_id);
create index if not exists idx_categories_business_type on public.categories (business_type);

create index if not exists idx_suppliers_business_id on public.suppliers (business_id);

create index if not exists idx_products_business_id on public.products (business_id);
create index if not exists idx_products_category_id on public.products (category_id);
create index if not exists idx_products_supplier_id on public.products (supplier_id);
create index if not exists idx_products_business_type on public.products (business_type);

create index if not exists idx_stock_movements_business_id on public.stock_movements (business_id);
create index if not exists idx_stock_movements_product_id on public.stock_movements (product_id);
create index if not exists idx_stock_movements_created_by on public.stock_movements (created_by);
create index if not exists idx_stock_movements_created_at on public.stock_movements (created_at);

create index if not exists idx_sales_business_id on public.sales (business_id);
create index if not exists idx_sales_created_by on public.sales (created_by);
create index if not exists idx_sales_created_at on public.sales (created_at);

create index if not exists idx_sale_items_sale_id on public.sale_items (sale_id);
create index if not exists idx_sale_items_product_id on public.sale_items (product_id);

create index if not exists idx_stock_alerts_business_id on public.stock_alerts (business_id);
create index if not exists idx_stock_alerts_product_id on public.stock_alerts (product_id);

-- -----------------------------------------------------------------------------
-- 4) updated_at triggers
-- -----------------------------------------------------------------------------

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

create trigger trg_businesses_updated_at
  before update on public.businesses
  for each row execute procedure public.set_updated_at();

create trigger trg_categories_updated_at
  before update on public.categories
  for each row execute procedure public.set_updated_at();

create trigger trg_suppliers_updated_at
  before update on public.suppliers
  for each row execute procedure public.set_updated_at();

create trigger trg_products_updated_at
  before update on public.products
  for each row execute procedure public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 5) New auth user -> profile
-- -----------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    )
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- -----------------------------------------------------------------------------
-- 6) RLS: membership helper (avoid recursion in policies)
-- -----------------------------------------------------------------------------

create or replace function public.is_business_member(p_business_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.business_users bu
    where bu.business_id = p_business_id
      and bu.user_id = (select auth.uid())
  );
$$;

create or replace function public.is_business_admin(p_business_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.business_users bu
    where bu.business_id = p_business_id
      and bu.user_id = (select auth.uid())
      and bu.role in ('owner', 'admin')
  );
$$;

grant execute on function public.is_business_member(uuid) to authenticated;
grant execute on function public.is_business_admin(uuid) to authenticated;

-- -----------------------------------------------------------------------------
-- 7) Row Level Security
-- -----------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.businesses enable row level security;
alter table public.business_users enable row level security;
alter table public.categories enable row level security;
alter table public.suppliers enable row level security;
alter table public.products enable row level security;
alter table public.stock_movements enable row level security;
alter table public.sales enable row level security;
alter table public.sale_items enable row level security;
alter table public.stock_alerts enable row level security;

-- profiles: own row only
create policy "Users can read own profile"
  on public.profiles for select
  to authenticated
  using (id = (select auth.uid()));

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- businesses
create policy "Members can read their businesses"
  on public.businesses for select
  to authenticated
  using (
    owner_id = (select auth.uid())
    or public.is_business_member(id)
  );

create policy "Users can create business as owner"
  on public.businesses for insert
  to authenticated
  with check (owner_id = (select auth.uid()));

create policy "Admins can update their businesses"
  on public.businesses for update
  to authenticated
  using (
    owner_id = (select auth.uid())
    or public.is_business_admin(id)
  )
  with check (
    owner_id = (select auth.uid())
    or public.is_business_admin(id)
  );

create policy "Owners can delete their businesses"
  on public.businesses for delete
  to authenticated
  using (owner_id = (select auth.uid()));

-- business_users
create policy "Members can read business user rows in their org"
  on public.business_users for select
  to authenticated
  using (public.is_business_member(business_id));

create policy "Business owners can insert membership rows"
  on public.business_users for insert
  to authenticated
  with check (
    public.is_business_admin(business_id)
    or exists (
      select 1
      from public.businesses b
      where b.id = business_id
        and b.owner_id = (select auth.uid())
    )
  );

create policy "Business owners can update membership"
  on public.business_users for update
  to authenticated
  using (
    public.is_business_admin(business_id)
    or exists (
      select 1
      from public.businesses b
      where b.id = business_id
        and b.owner_id = (select auth.uid())
    )
  )
  with check (
    public.is_business_admin(business_id)
    or exists (
      select 1
      from public.businesses b
      where b.id = business_id
        and b.owner_id = (select auth.uid())
    )
  );

create policy "Business owners can delete membership"
  on public.business_users for delete
  to authenticated
  using (
    public.is_business_admin(business_id)
    or exists (
      select 1
      from public.businesses b
      where b.id = business_id
        and b.owner_id = (select auth.uid())
    )
  );

-- shared pattern for business-scoped tables
-- categories, suppliers, products, stock_movements, sales, stock_alerts

create policy "Members manage categories"
  on public.categories for all
  to authenticated
  using (public.is_business_member(business_id))
  with check (public.is_business_member(business_id));

create policy "Members manage suppliers"
  on public.suppliers for all
  to authenticated
  using (public.is_business_member(business_id))
  with check (public.is_business_member(business_id));

create policy "Members manage products"
  on public.products for all
  to authenticated
  using (public.is_business_member(business_id))
  with check (public.is_business_member(business_id));

create policy "Members manage stock_movements"
  on public.stock_movements for all
  to authenticated
  using (public.is_business_member(business_id))
  with check (public.is_business_member(business_id));

create policy "Members manage sales"
  on public.sales for all
  to authenticated
  using (public.is_business_member(business_id))
  with check (public.is_business_member(business_id));

create policy "Members manage stock_alerts"
  on public.stock_alerts for all
  to authenticated
  using (public.is_business_member(business_id))
  with check (public.is_business_member(business_id));

-- sale_items: via parent sale's business
create policy "Members manage sale_items"
  on public.sale_items for all
  to authenticated
  using (
    exists (
      select 1
      from public.sales s
      where s.id = sale_id
        and public.is_business_member(s.business_id)
    )
  )
  with check (
    exists (
      select 1
      from public.sales s
      where s.id = sale_id
        and public.is_business_member(s.business_id)
    )
  );

-- -----------------------------------------------------------------------------
-- 8) Grants
-- -----------------------------------------------------------------------------

grant usage on schema public to postgres, anon, authenticated, service_role;

grant select, insert, update, delete on all tables in schema public to postgres, service_role;
grant select, insert, update, delete on all tables in schema public to authenticated;

-- Fase 2: sin Realtime; activar luego en dashboard si aplica

