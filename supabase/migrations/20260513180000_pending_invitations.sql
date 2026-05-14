-- MultiStock: tabla de invitaciones pendientes
-- =============================================
-- Permite al owner invitar a personas que aún no tienen cuenta.
-- Cuando el invitado se registre, se crea automaticamente el vínculo.
--
-- Reglas:
-- - Un email solo puede tener UNA invitacion por negocio (unique)
-- - Al registrarse el invitado, se elimina de pending_invitations
-- - El owner puede cancelar invitaciones pendientes
--
-- Las policies usan lógica directa (NO funciones helper) para no depender
-- de migraciones externas. Si la tabla ya existe, se salta.

do $$
begin
  if not exists (select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'pending_invitations')
  then
    create table public.pending_invitations (
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

    -- Cualquier miembro del negocio (dueño por owner_id o invite por business_users) puede SELECT
    create policy "Members can view pending_invitations"
      on public.pending_invitations for select
      to authenticated
      using (
        exists (
          select 1 from public.businesses b
          where b.id = business_id and b.owner_id = (select auth.uid())
        )
        or exists (
          select 1 from public.business_users bu
          where bu.business_id = business_id and bu.user_id = (select auth.uid())
        )
      );

    -- Solo owner puede INSERT
    create policy "Owner can insert pending_invitations"
      on public.pending_invitations for insert
      to authenticated
      with check (
        exists (
          select 1 from public.businesses b
          where b.id = business_id and b.owner_id = (select auth.uid())
        )
      );

    -- Solo owner puede DELETE
    create policy "Owner can delete pending_invitations"
      on public.pending_invitations for delete
      to authenticated
      using (
        exists (
          select 1 from public.businesses b
          where b.id = business_id and b.owner_id = (select auth.uid())
        )
      );
  end if;
end $$;
