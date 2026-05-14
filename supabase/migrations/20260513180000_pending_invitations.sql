-- MultiStock: tabla de invitaciones pendientes
-- =============================================
-- Permite al owner invitar a personas que aún no tienen cuenta.
-- Cuando el invitado se registre, se crea automaticamente el vínculo.
--
-- Reglas:
-- - Un email solo puede tener UNA invitacion por negocio (unique)
-- - Al registrarse el invitado, se elimina de pending_invitations
-- - El owner puede cancelar invitaciones pendientes

create table if not exists public.pending_invitations (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  email text not null,
  role text not null default 'employee',
  invited_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  unique(business_id, email)
);

-- RLS: solo miembros del negocio pueden ver/borrar invitaciones del negocio
alter table public.pending_invitations enable row level security;

-- Owner/admin puede ver invitaciones de su negocio
create policy "Members can view pending_invitations"
  on public.pending_invitations for select
  to authenticated
  using (public.is_business_member(business_id));

-- Owner/admin puede insertar invitaciones
create policy "Admin can insert pending_invitations"
  on public.pending_invitations for insert
  to authenticated
  with check (public.is_business_admin(business_id));

-- Owner/admin puede borrar invitaciones
create policy "Admin can delete pending_invitations"
  on public.pending_invitations for delete
  to authenticated
  using (public.is_business_admin(business_id));

-- Index para busqueda rapida por email al registrarse
create index if not exists idx_pending_invitations_email
  on public.pending_invitations (email);
