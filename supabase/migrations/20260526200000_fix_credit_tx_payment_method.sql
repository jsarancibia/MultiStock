-- Fix: credit_transactions.payment_method check constraint — valores en español para consistencia con ventas

alter table public.credit_transactions
  drop constraint if exists credit_transactions_payment_method_check;

alter table public.credit_transactions
  add constraint credit_transactions_payment_method_check
  check (payment_method is null or payment_method in ('efectivo', 'debito', 'credito', 'transferencia', 'otro', 'credit'));
