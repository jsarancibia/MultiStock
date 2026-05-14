-- MultiStock: tabla de invitaciones pendientes
-- =============================================
-- Permite al owner invitar a personas que aún no tienen cuenta.
-- Cuando el invitado se registre, se crea automaticamente el vínculo.
--
-- ⚠ SIN RLS policies: la seguridad va por server action (requireBusinessRole)
-- Las policies se agregarán manualmente cuando se confirme el proyecto Supabase correcto.

create table if not exists public.pending_invitations (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null,
  email text not null,
  role text not null default 'employee',
  invited_by uuid not null,
  created_at timestamptz not null default now(),
  unique(business_id, email)
);

create index if not exists idx_pending_invitations_email
  on public.pending_invitations (email);

alter table public.pending_invitations enable row level security;
