-- Financial integrity fixes for credit module
-- 1. Trigger: block direct current_balance UPDATE (must go through RPCs)
-- 2. Safe payment_method constraint migration
-- 3. Clean dead credit_high_balance from stock_alerts

-- -----------------------------------------------------------------------------
-- 1) Trigger: block direct current_balance updates
--    Only SECURITY DEFINER RPCs can modify current_balance
-- -----------------------------------------------------------------------------

create or replace function public.check_credit_balance_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if TG_OP = 'UPDATE' and new.current_balance is distinct from old.current_balance then
    raise exception 'No se puede modificar el saldo directamente. Usa las funciones de pago o ajuste.';
  end if;
  return new;
end;
$$;

create trigger trg_block_balance_direct_update
  before update on public.credit_customers
  for each row
  execute function public.check_credit_balance_update();

-- -----------------------------------------------------------------------------
-- 2) Safe payment_method migration: remap existing rows before changing constraint
-- -----------------------------------------------------------------------------

update public.credit_transactions
set payment_method =
  case payment_method
    when 'cash' then 'efectivo'
    when 'transfer' then 'transferencia'
    when 'other' then 'otro'
    else payment_method
  end
where payment_method is not null;

alter table public.credit_transactions
  drop constraint if exists credit_transactions_payment_method_check;

alter table public.credit_transactions
  add constraint credit_transactions_payment_method_check
  check (payment_method is null or payment_method in ('efectivo', 'debito', 'credito', 'transferencia', 'otro', 'credit'));

-- -----------------------------------------------------------------------------
-- 3) Clean: remove dead credit_high_balance from stock_alerts type check
-- -----------------------------------------------------------------------------

alter table public.stock_alerts
  drop constraint if exists stock_alerts_type_check;

alter table public.stock_alerts
  add constraint stock_alerts_type_check
  check (type in ('low_stock', 'out_of_stock', 'perishable_warning', 'waste_warning'));
