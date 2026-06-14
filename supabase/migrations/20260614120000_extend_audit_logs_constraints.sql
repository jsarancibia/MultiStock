-- Extiende los CHECK constraints de audit_logs para incluir
-- credit_customer, credit_transaction, team_member y las nuevas acciones.
-- Se usa drop if exists + add para ser seguro y repetible.

alter table public.audit_logs
  drop constraint if exists audit_logs_entity_type_check;

alter table public.audit_logs
  add constraint audit_logs_entity_type_check
  check (entity_type in (
    'product',
    'stock_movement',
    'sale',
    'supplier',
    'category',
    'stock_alert',
    'business',
    'team_member',
    'credit_customer',
    'credit_transaction'
  ));

alter table public.audit_logs
  drop constraint if exists audit_logs_action_check;

alter table public.audit_logs
  add constraint audit_logs_action_check
  check (action in (
    'created',
    'updated',
    'deleted',
    'deactivated',
    'stock_changed',
    'price_changed',
    'sale_confirmed',
    'alert_resolved',
    'alert_bulk_resolved',
    'sale_credited',
    'payment_registered',
    'limit_changed',
    'credit_adjusted',
    'voided'
  ));
