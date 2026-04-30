-- Fase 13: trazabilidad de acciones sensibles por negocio

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete set null,
  entity_type text not null,
  entity_id uuid,
  action text not null,
  summary text not null,
  before_data jsonb,
  after_data jsonb,
  metadata jsonb,
  created_at timestamptz not null default now(),
  constraint audit_logs_entity_type_check check (
    entity_type in (
      'product',
      'stock_movement',
      'sale',
      'supplier',
      'category',
      'stock_alert',
      'business'
    )
  ),
  constraint audit_logs_action_check check (
    action in (
      'created',
      'updated',
      'deleted',
      'deactivated',
      'stock_changed',
      'price_changed',
      'sale_confirmed',
      'alert_resolved'
    )
  )
);

create index if not exists idx_audit_logs_business_id on public.audit_logs (business_id);
create index if not exists idx_audit_logs_created_at on public.audit_logs (created_at desc);
create index if not exists idx_audit_logs_entity on public.audit_logs (entity_type, entity_id);

alter table public.audit_logs enable row level security;

create policy "Members read audit logs of their business"
  on public.audit_logs for select
  to authenticated
  using (public.is_business_member(business_id));

create policy "Members insert audit logs for their business"
  on public.audit_logs for insert
  to authenticated
  with check (public.is_business_member(business_id));

grant select, insert on public.audit_logs to authenticated;
