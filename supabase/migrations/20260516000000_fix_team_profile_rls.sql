-- MultiStock: permitir leer perfiles de miembros del mismo negocio
--
-- La política original "Users can read own profile" solo permite leer el
-- perfil propio (id = auth.uid()). Esto hace que los joins a profiles desde
-- business_users retornen NULL para todo perfil que no sea el del usuario
-- actual, mostrando "Sin nombre" / "Sin email" en la página de equipo.
--
-- Esta migración agrega una política adicional que permite leer perfiles
-- de usuarios con los que compartes un negocio en business_users.

create or replace function public.get_business_member_ids()
returns table(user_id uuid)
language sql
stable
security definer
set search_path = public
as $$
  select bu.user_id
  from public.business_users bu
  where bu.business_id in (
    select b.business_id
    from public.business_users b
    where b.user_id = (select auth.uid())
  );
$$;

drop policy if exists "Members can read profiles of their business peers" on public.profiles;

create policy "Members can read profiles of their business peers"
  on public.profiles for select
  to authenticated
  using (
    id in (select public.get_business_member_ids())
  );
