-- MultiStock: fix case-insensitive email comparison in invitation RLS policies
-- ===========================================================================
-- Problema: Las políticas RLS comparan email con auth.jwt() ->> 'email'
-- usando =. Si el dueño invita con minúscula (inviteMemberAction usa .toLowerCase())
-- pero el empleado se registra con mayúsculas, la comparación falla y el usuario
-- no puede ver sus invitaciones ni aceptarlas.
--
-- Solución: Usar lower() en ambos lados de la comparación.

-- 1. Política SELECT en pending_invitations: usuario ve sus propias invitaciones
drop policy if exists "Users can view own pending invitations by email" on public.pending_invitations;
create policy "Users can view own pending invitations by email"
  on public.pending_invitations for select
  to authenticated
  using (lower(email) = lower(auth.jwt() ->> 'email'));

-- 2. Política DELETE en pending_invitations: usuario limpia la suya
drop policy if exists "Users can delete own pending invitations" on public.pending_invitations;
create policy "Users can delete own pending invitations"
  on public.pending_invitations for delete
  to authenticated
  using (lower(email) = lower(auth.jwt() ->> 'email'));

-- 3. Política INSERT en business_users: invitado puede aceptar
drop policy if exists "Invited users can accept pending invitation" on public.business_users;
create policy "Invited users can accept pending invitation"
  on public.business_users for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and role = 'employee'
    and exists (
      select 1 from public.pending_invitations pi
      where pi.business_id = business_users.business_id
        and lower(pi.email) = lower(auth.jwt() ->> 'email')
    )
  );
