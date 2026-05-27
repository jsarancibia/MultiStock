-- Fix: credit_transactions.payment_method check constraint no incluye 'credit' (que usa la RPC create_credit_sale)
-- Agregar 'credit' a la lista de valores permitidos

alter table public.credit_transactions
  drop constraint if exists credit_transactions_payment_method_check;

alter table public.credit_transactions
  add constraint credit_transactions_payment_method_check
  check (payment_method is null or payment_method in ('cash', 'transfer', 'mercado_pago', 'khipu', 'credit', 'other'));
