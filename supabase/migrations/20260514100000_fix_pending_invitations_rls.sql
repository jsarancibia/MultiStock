-- MultiStock: corrige RLS de pending_invitations
-- =====================================================
-- Problema: La tabla tiene RLS habilitado pero SIN políticas.
-- Cuando un empleado se registra y el server action intenta
-- leer pending_invitations para vincularlo automáticamente,
-- RLS bloquea la SELECT (data: []) y el flujo cae al onboarding.
--
-- Solución: Agregar política SELECT que permita al usuario
-- autenticado ver SOLO sus propias invitaciones por email.
-- La política usa auth.jwt() ->> 'email' que es el email
-- verificado del token de autenticación.

-- 1. Política SELECT: el usuario puede ver sus propias invitaciones pendientes
create policy "Users can view own pending invitations by email"
  on public.pending_invitations for select
  to authenticated
  using (email = auth.jwt() ->> 'email');

-- 2. Política SELECT para owners: el dueño del negocio puede ver todas las invitaciones de su negocio
create policy "Owners can view pending invitations of their business"
  on public.pending_invitations for select
  to authenticated
  using (
    exists (
      select 1 from public.businesses
      where id = business_id
      and owner_id = auth.uid()
    )
  );
