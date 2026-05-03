-- PostgREST resuelve la sobrecarga de RPC ordenando argumentos alfabéticamente por nombre:
-- p_business_id, p_created_by, p_items, p_payment_method -> (uuid, uuid, jsonb, text).
-- La función original (uuid, uuid, text, jsonb) no coincide y devuelve PGRST202 en el cliente.

drop function if exists public.create_sale_with_items(uuid, uuid, text, jsonb);

create or replace function public.create_sale_with_items(
  p_business_id uuid,
  p_created_by uuid,
  p_items jsonb,
  p_payment_method text
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

  insert into public.sales (business_id, total, payment_method, created_by)
  values (p_business_id, 0, p_payment_method, p_created_by)
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
    v_total := v_total + v_subtotal;
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
      format('Venta %s', v_sale_id),
      p_created_by
    );

    if v_new_stock <= v_product.min_stock then
      if not exists (
        select 1
        from public.stock_alerts sa
        where sa.business_id = p_business_id
          and sa.product_id = v_product_id
          and sa.type = 'low_stock'
          and sa.resolved = false
      ) then
        insert into public.stock_alerts (business_id, product_id, type, message, resolved)
        values (
          p_business_id,
          v_product_id,
          'low_stock',
          'Producto en o por debajo de stock minimo.',
          false
        );
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

  update public.sales
  set total = v_total
  where id = v_sale_id;

  return v_sale_id;
end;
$$;

grant execute on function public.create_sale_with_items(uuid, uuid, jsonb, text) to authenticated;
