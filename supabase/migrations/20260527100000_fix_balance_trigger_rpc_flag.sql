-- Fix trigger: permite que las RPCs actualicen current_balance via bandera de sesion
-- Bloquea UPDATEs directos (sin bandera = app credit_rpc != '1')

-- 1. Borrar trigger y funcion viejos
drop trigger if exists trg_block_balance_direct_update on public.credit_customers;
drop function if exists public.check_credit_balance_update();

-- 2. Nueva funcion con checkpoint de bandera de sesion
create or replace function public.check_credit_balance_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if TG_OP = 'UPDATE'
     and new.current_balance is distinct from old.current_balance
     and current_setting('app.credit_rpc', true) is distinct from '1' then
    raise exception 'No se puede modificar el saldo directamente. Usa las funciones de pago o ajuste.';
  end if;
  return new;
end;
$$;

-- 3. Recrear trigger
create trigger trg_block_balance_direct_update
  before update on public.credit_customers
  for each row
  execute function public.check_credit_balance_update();

-- 4. create_credit_sale con bandera
create or replace function public.create_credit_sale(
  p_business_id uuid,
  p_created_by uuid,
  p_items jsonb,
  p_payment_method text,
  p_customer_id uuid
)
returns uuid
language plpgsql
security definer
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

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_product_id := (v_item->>'product_id')::uuid;
    v_quantity := (v_item->>'quantity')::numeric;

    select sale_price into v_product
    from public.products
    where id = v_product_id
      and business_id = p_business_id;

    v_unit_price := coalesce(nullif(v_item->>'unit_price', '')::numeric, v_product.sale_price);
    v_subtotal := v_quantity * v_unit_price;
    v_total := v_total + v_subtotal;
  end loop;

  v_new_balance := v_customer.current_balance + v_total;
  if v_new_balance > v_customer.credit_limit then
    raise exception 'El cliente excede su limite de credito (limite: %, nuevo saldo: %)',
      v_customer.credit_limit, v_new_balance;
  end if;

  insert into public.sales (business_id, total, payment_method, created_by)
  values (p_business_id, v_total, p_payment_method, p_created_by)
  returning id into v_sale_id;

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

  insert into public.credit_transactions (
    business_id, customer_id, type, amount,
    balance_before, balance_after,
    reference_sale_id, payment_method, description, created_by
  ) values (
    p_business_id, p_customer_id, 'sale', v_total,
    v_customer.current_balance, v_new_balance,
    v_sale_id, 'credit', format('Venta fiado #%s', v_sale_id), p_created_by
  );

  perform set_config('app.credit_rpc', '1', true);
  update public.credit_customers
  set current_balance = v_new_balance
  where id = p_customer_id;
  perform set_config('app.credit_rpc', '', true);

  return v_sale_id;
end;
$$;

grant execute on function public.create_credit_sale(uuid, uuid, jsonb, text, uuid) to authenticated;

-- 5. register_credit_payment con bandera
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
security definer
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

  perform set_config('app.credit_rpc', '1', true);
  update public.credit_customers
  set current_balance = v_new_balance
  where id = p_customer_id;
  perform set_config('app.credit_rpc', '', true);

  return v_tx_id;
end;
$$;

grant execute on function public.register_credit_payment(uuid, uuid, numeric, text, text, uuid) to authenticated;

-- 6. void_credit_transaction con bandera
create or replace function public.void_credit_transaction(
  p_business_id uuid,
  p_transaction_id uuid,
  p_reason text,
  p_created_by uuid
)
returns uuid
language plpgsql
security definer
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

  select id, name, current_balance
    into v_customer
  from public.credit_customers
  where id = v_tx.customer_id
    and business_id = p_business_id
  for update;

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

  perform set_config('app.credit_rpc', '1', true);
  update public.credit_customers
  set current_balance = v_new_balance
  where id = v_tx.customer_id;
  perform set_config('app.credit_rpc', '', true);

  return v_void_id;
end;
$$;

grant execute on function public.void_credit_transaction(uuid, uuid, text, uuid) to authenticated;
