-- MultiStock: agrega policy INSERT en pending_invitations
-- =========================================================
-- Problema: la tabla pending_invitations tiene RLS habilitado pero ninguna
-- policy INSERT. Cuando el owner invita a alguien sin cuenta (inviteMemberAction
-- usa createClient(), cliente normal), PostgREST bloquea la inserción con
-- "new row violates row-level security policy".
--
-- Solución: permitir INSERT solo al owner del negocio destino.

create policy "Owners can insert pending invitations for their business"
  on public.pending_invitations for insert
  to authenticated
  with check (
    exists (
      select 1 from public.businesses
      where id = business_id
        and owner_id = auth.uid()
    )
  );
