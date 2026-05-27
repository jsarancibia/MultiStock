-- MultiStock: modulo Fiado (credito a clientes)
-- Disenado como sistema bancario simplificado:
--   credit_transactions es INMUTABLE (solo INSERT)
--   RPCs con FOR UPDATE para race conditions
--   Saldo desnormalizado en credit_customers + constraint check de consistencia

-- -----------------------------------------------------------------------------
-- 1) credit_customers
-- -----------------------------------------------------------------------------

create table if not exists public.credit_customers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  rut text,
  name text not null,
  phone text,
  credit_limit numeric(14,4) not null default 0 check (credit_limit >= 0),
  current_balance numeric(14,4) not null default 0 check (current_balance >= 0),
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint credit_customers_business_rut_unique unique (business_id, rut)
);

create index if not exists idx_cc_business on public.credit_customers(business_id);
create index if not exists idx_cc_business_active on public.credit_customers(business_id, active);
create index if not exists idx_cc_balance_desc on public.credit_customers(business_id, current_balance desc);
create index if not exists idx_cc_name_search on public.credit_customers(business_id, name);

-- -----------------------------------------------------------------------------
-- 2) credit_transactions — INMUTABLE (solo INSERT permitido via RPC)
-- -----------------------------------------------------------------------------

create table if not exists public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  customer_id uuid not null references public.credit_customers(id) on delete restrict,
  type text not null check (type in ('sale', 'payment', 'adjustment', 'void')),
  amount numeric(14,4) not null check (amount <> 0),
  balance_before numeric(14,4) not null check (balance_before >= 0),
  balance_after numeric(14,4) not null check (balance_after >= 0),
  reference_sale_id uuid references public.sales(id) on delete set null,
  payment_method text check (payment_method in ('cash', 'transfer', 'mercado_pago', 'khipu', 'other')),
  description text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint ct_balance_consistency check (balance_after = balance_before + amount)
);

create index if not exists idx_ct_customer on public.credit_transactions(customer_id);
create index if not exists idx_ct_customer_chrono on public.credit_transactions(customer_id, created_at);
create index if not exists idx_ct_business on public.credit_transactions(business_id);
create index if not exists idx_ct_sale on public.credit_transactions(reference_sale_id);
create index if not exists idx_ct_created_by on public.credit_transactions(created_by);

-- -----------------------------------------------------------------------------
-- 3) updated_at trigger para credit_customers
-- -----------------------------------------------------------------------------

create trigger trg_credit_customers_updated_at
  before update on public.credit_customers
  for each row execute procedure public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 4) RPC: create_credit_sale — venta fiado atomica con lock de fila
-- -----------------------------------------------------------------------------

create or replace function public.create_credit_sale(
  p_business_id uuid,
  p_created_by uuid,
  p_items jsonb,
  p_payment_method text,
  p_customer_id uuid
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_sale_id uuid;
  v_total numeric(14, 4) := 0;
  v_item jsonb;
  v_product_id uuid;
  v_quantity numeric(14, 4);
  v_unit_price numeric(14, 4);
  v_subtotal numeric(14, 4);
  v_product record;
  v_new_stock numeric(14, 4);
  v_customer record;
  v_new_balance numeric(14, 4);
begin
  if auth.uid() is null then
    raise exception 'No autenticado';
  end if;

  if not public.is_business_member(p_business_id) then
    raise exception 'No autorizado para este negocio';
  end if;

  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'La venta debe incluir al menos un item';
  end if;

  -- Lock fila del cliente para evitar race conditions
  select id, name, active, credit_limit, current_balance
    into v_customer
  from public.credit_customers
  where id = p_customer_id
    and business_id = p_business_id
  for update;

  if not found then
    raise exception 'Cliente no encontrado';
  end if;

  if not v_customer.active then
    raise exception 'El cliente esta inactivo y no puede recibir fiado';
  end if;

  -- Pre-validar productos y calcular total
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_product_id := (v_item->>'product_id')::uuid;
    v_quantity := (v_item->>'quantity')::numeric;

    if v_quantity is null or v_quantity <= 0 then
      raise exception 'Cantidad invalida en item de venta';
    end if;

    select id, active, unit_type, current_stock, min_stock, sale_price
      into v_product
    from public.products
    where id = v_product_id
      and business_id = p_business_id
    for update;

    if not found then
      raise exception 'Producto no encontrado para la venta';
    end if;

    if not v_product.active then
      raise exception 'No se puede vender un producto inactivo';
    end if;

    if v_product.unit_type not in ('kg', 'g', 'liter', 'meter') and trunc(v_quantity) <> v_quantity then
      raise exception 'Cantidad decimal no permitida para unidad %', v_product.unit_type;
    end if;

    if v_quantity > v_product.current_stock then
      raise exception 'Stock insuficiente para producto %', v_product.id;
    end if;
  end loop;

  -- Calcular total
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_product_id := (v_item->>'product_id')::uuid;
    v_quantity := (v_item->>'quantity')::numeric;

    select sale_price into v_product
    from public.products
    where id = v_product_id;

    v_unit_price := coalesce(nullif(v_item->>'unit_price', '')::numeric, v_product.sale_price);
    v_subtotal := v_quantity * v_unit_price;
    v_total := v_total + v_subtotal;
  end loop;

  -- Validar limite de credito
  v_new_balance := v_customer.current_balance + v_total;
  if v_customer.credit_limit > 0 and v_new_balance > v_customer.credit_limit then
    raise exception 'El cliente excede su limite de credito (limite: %, nuevo saldo: %)',
      v_customer.credit_limit, v_new_balance;
  end if;

  -- Crear venta
  insert into public.sales (business_id, total, payment_method, created_by)
  values (p_business_id, v_total, 'credit', p_created_by)
  returning id into v_sale_id;

  -- Crear items, deducir stock, registrar movimientos
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_product_id := (v_item->>'product_id')::uuid;
    v_quantity := (v_item->>'quantity')::numeric;

    select id, current_stock, min_stock, sale_price
      into v_product
    from public.products
    where id = v_product_id
      and business_id = p_business_id
    for update;

    v_unit_price := coalesce(nullif(v_item->>'unit_price', '')::numeric, v_product.sale_price);
    v_subtotal := v_quantity * v_unit_price;
    v_new_stock := v_product.current_stock - v_quantity;

    insert into public.sale_items (sale_id, product_id, quantity, unit_price, subtotal)
    values (v_sale_id, v_product_id, v_quantity, v_unit_price, v_subtotal);

    update public.products
    set current_stock = v_new_stock
    where id = v_product_id
      and business_id = p_business_id;

    insert into public.stock_movements (business_id, product_id, type, quantity, reason, created_by)
    values (
      p_business_id,
      v_product_id,
      'sale',
      (v_quantity * -1),
      format('Venta fiado %s', v_sale_id),
      p_created_by
    );

    if v_new_stock <= v_product.min_stock then
      if not exists (
        select 1 from public.stock_alerts sa
        where sa.business_id = p_business_id
          and sa.product_id = v_product_id
          and sa.type = 'low_stock'
          and sa.resolved = false
      ) then
        insert into public.stock_alerts (business_id, product_id, type, message, resolved)
        values (p_business_id, v_product_id, 'low_stock', 'Producto en o por debajo de stock minimo.', false);
      end if;
    else
      update public.stock_alerts
      set resolved = true
      where business_id = p_business_id
        and product_id = v_product_id
        and type = 'low_stock'
        and resolved = false;
    end if;
  end loop;

  update public.sales set total = v_total where id = v_sale_id;

  -- Registrar transaccion de credito (inmutable)
  insert into public.credit_transactions (
    business_id, customer_id, type, amount,
    balance_before, balance_after,
    reference_sale_id, payment_method, description, created_by
  ) values (
    p_business_id, p_customer_id, 'sale', v_total,
    v_customer.current_balance, v_new_balance,
    v_sale_id, 'credit', format('Venta fiado #%s', v_sale_id), p_created_by
  );

  -- Actualizar saldo del cliente
  update public.credit_customers
  set current_balance = v_new_balance
  where id = p_customer_id;

  -- Alerta si supera 80% del limite
  if v_customer.credit_limit > 0 and (v_new_balance::numeric / v_customer.credit_limit::numeric) > 0.8 then
    if not exists (
      select 1 from public.stock_alerts sa
      where sa.business_id = p_business_id
        and sa.product_id = p_customer_id
        and sa.type = 'credit_high_balance'
        and sa.resolved = false
    ) then
      insert into public.stock_alerts (business_id, product_id, type, message, resolved)
      values (
        p_business_id,
        p_customer_id,
        'credit_high_balance',
        format('Cliente %s tiene saldo alto: $%s de $%s limite', v_customer.name, v_new_balance, v_customer.credit_limit),
        false
      );
    end if;
  end if;

  return v_sale_id;
end;
$$;

grant execute on function public.create_credit_sale(uuid, uuid, jsonb, text, uuid) to authenticated;

-- -----------------------------------------------------------------------------
-- 5) RPC: register_credit_payment — registro de pago con lock
-- -----------------------------------------------------------------------------

create or replace function public.register_credit_payment(
  p_business_id uuid,
  p_customer_id uuid,
  p_amount numeric,
  p_payment_method text,
  p_description text default null,
  p_created_by uuid default null
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_customer record;
  v_new_balance numeric(14, 4);
  v_tx_id uuid;
begin
  if auth.uid() is null then
    raise exception 'No autenticado';
  end if;

  if not public.is_business_member(p_business_id) then
    raise exception 'No autorizado para este negocio';
  end if;

  if p_amount <= 0 then
    raise exception 'El monto del pago debe ser mayor a cero';
  end if;

  -- Lock fila del cliente
  select id, name, current_balance, active
    into v_customer
  from public.credit_customers
  where id = p_customer_id
    and business_id = p_business_id
  for update;

  if not found then
    raise exception 'Cliente no encontrado';
  end if;

  if not v_customer.active then
    raise exception 'El cliente esta inactivo';
  end if;

  v_new_balance := v_customer.current_balance - p_amount;

  if v_new_balance < 0 then
    raise exception 'El pago excede la deuda actual (deuda: %s, pago: %s)',
      v_customer.current_balance, p_amount;
  end if;

  -- Insertar transaccion de credito
  insert into public.credit_transactions (
    business_id, customer_id, type, amount,
    balance_before, balance_after,
    payment_method, description, created_by
  ) values (
    p_business_id, p_customer_id, 'payment', (p_amount * -1),
    v_customer.current_balance, v_new_balance,
    p_payment_method, coalesce(p_description, 'Pago registrado'), p_created_by
  )
  returning id into v_tx_id;

  -- Actualizar saldo
  update public.credit_customers
  set current_balance = v_new_balance
  where id = p_customer_id;

  -- Resolver alerta de saldo alto si corresponde
  update public.stock_alerts
  set resolved = true
  where business_id = p_business_id
    and product_id = p_customer_id
    and type = 'credit_high_balance'
    and resolved = false;

  return v_tx_id;
end;
$$;

grant execute on function public.register_credit_payment(uuid, uuid, numeric, text, text, uuid) to authenticated;

-- -----------------------------------------------------------------------------
-- 6) RPC: void_credit_transaction — anular transaccion (solo owner via app)
-- -----------------------------------------------------------------------------

create or replace function public.void_credit_transaction(
  p_business_id uuid,
  p_transaction_id uuid,
  p_reason text,
  p_created_by uuid
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_tx record;
  v_customer record;
  v_new_balance numeric(14, 4);
  v_void_id uuid;
begin
  if auth.uid() is null then
    raise exception 'No autenticado';
  end if;

  if not public.is_business_member(p_business_id) then
    raise exception 'No autorizado para este negocio';
  end if;

  if p_reason is null or trim(p_reason) = '' then
    raise exception 'Debe indicar una razon para anular la transaccion';
  end if;

  -- Lock de la transaccion original
  select id, customer_id, type, amount, balance_before, balance_after
    into v_tx
  from public.credit_transactions
  where id = p_transaction_id
    and business_id = p_business_id
  for update;

  if not found then
    raise exception 'Transaccion no encontrada';
  end if;

  if v_tx.type = 'void' then
    raise exception 'No se puede anular una transaccion ya anulada';
  end if;

  -- Lock del cliente
  select id, name, current_balance
    into v_customer
  from public.credit_customers
  where id = v_tx.customer_id
    and business_id = p_business_id
  for update;

  -- Revertir: si la original aumento saldo, la anulacion lo reduce y viceversa
  v_new_balance := v_customer.current_balance - v_tx.amount;

  if v_new_balance < 0 then
    raise exception 'No se puede anular: resultado en saldo negativo';
  end if;

  insert into public.credit_transactions (
    business_id, customer_id, type, amount,
    balance_before, balance_after,
    description, created_by
  ) values (
    p_business_id, v_tx.customer_id, 'void', (v_tx.amount * -1),
    v_customer.current_balance, v_new_balance,
    format('Anulacion de transaccion %s: %s', v_tx.id, p_reason), p_created_by
  )
  returning id into v_void_id;

  update public.credit_customers
  set current_balance = v_new_balance
  where id = v_tx.customer_id;

  return v_void_id;
end;
$$;

grant execute on function public.void_credit_transaction(uuid, uuid, text, uuid) to authenticated;

-- -----------------------------------------------------------------------------
-- 7) RPC: reconcile_customer_balance — verificacion de consistencia
-- -----------------------------------------------------------------------------

create or replace function public.reconcile_customer_balance(p_customer_id uuid)
returns table(expected numeric, actual numeric, match boolean)
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_sum numeric;
  v_balance numeric;
begin
  select coalesce(sum(amount), 0) into v_sum
  from public.credit_transactions
  where customer_id = p_customer_id;

  select current_balance into v_balance
  from public.credit_customers
  where id = p_customer_id;

  return query select v_sum, v_balance, (v_sum = v_balance);
end;
$$;

grant execute on function public.reconcile_customer_balance(uuid) to authenticated;

-- -----------------------------------------------------------------------------
-- 8) Extender stock_alerts type check para incluir credit_high_balance
-- -----------------------------------------------------------------------------

alter table public.stock_alerts drop constraint if exists stock_alerts_type_check;

alter table public.stock_alerts add constraint stock_alerts_type_check check (
  type in ('low_stock', 'out_of_stock', 'perishable_warning', 'waste_warning', 'credit_high_balance')
);

-- -----------------------------------------------------------------------------
-- 9) RLS policies
-- -----------------------------------------------------------------------------

alter table public.credit_customers enable row level security;
alter table public.credit_transactions enable row level security;

-- credit_customers
create policy "Members can read credit customers"
  on public.credit_customers for select
  to authenticated
  using (public.is_business_member(business_id));

create policy "Business admins can insert credit customers"
  on public.credit_customers for insert
  to authenticated
  with check (
    public.is_business_admin(business_id)
    or exists (
      select 1 from public.businesses b
      where b.id = business_id and b.owner_id = (select auth.uid())
    )
  );

create policy "Business admins can update credit customers"
  on public.credit_customers for update
  to authenticated
  using (
    public.is_business_admin(business_id)
    or exists (
      select 1 from public.businesses b
      where b.id = business_id and b.owner_id = (select auth.uid())
    )
  )
  with check (
    public.is_business_admin(business_id)
    or exists (
      select 1 from public.businesses b
      where b.id = business_id and b.owner_id = (select auth.uid())
    )
  );

create policy "Only owners can delete credit customers (with zero balance)"
  on public.credit_customers for delete
  to authenticated
  using (
    current_balance = 0
    and exists (
      select 1 from public.businesses b
      where b.id = business_id and b.owner_id = (select auth.uid())
    )
  );

-- credit_transactions: inmutable — solo SELECT, INSERT via RPC
create policy "Members can read credit transactions"
  on public.credit_transactions for select
  to authenticated
  using (public.is_business_member(business_id));

create policy "No direct insert on credit_transactions"
  on public.credit_transactions for insert
  to authenticated
  with check (false);

create policy "No direct update on credit_transactions"
  on public.credit_transactions for update
  to authenticated
  using (false);

create policy "No direct delete on credit_transactions"
  on public.credit_transactions for delete
  to authenticated
  using (false);

-- -----------------------------------------------------------------------------
-- 10) Grants
-- -----------------------------------------------------------------------------

grant select, insert, update, delete on public.credit_customers to authenticated;
grant select on public.credit_transactions to authenticated;
