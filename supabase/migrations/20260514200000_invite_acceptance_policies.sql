-- MultiStock: políticas RLS para que el empleado invitado pueda aceptar su invitación
-- =====================================================================================
-- Problema: la vinculación de invitaciones dependía del service_role key en Vercel.
-- Si ese key no está disponible en la ejecución, el proceso falla silenciosamente.
--
-- Solución: agregar políticas RLS que permitan al propio usuario autenticado:
--   1. Insertar su propia fila en business_users si tiene una pending_invitation.
--   2. Eliminar su propia pending_invitation después de aceptarla.
-- Así el flujo funciona con el cliente anon normal (sin service_role).

-- 1. Política INSERT en business_users para que el invitado pueda aceptar
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
        and pi.email = auth.jwt() ->> 'email'
    )
  );

-- 2. Política DELETE en pending_invitations para que el usuario limpie la suya
drop policy if exists "Users can delete own pending invitations" on public.pending_invitations;
create policy "Users can delete own pending invitations"
  on public.pending_invitations for delete
  to authenticated
  using (email = auth.jwt() ->> 'email');
