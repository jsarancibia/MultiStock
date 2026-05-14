-- MultiStock: cambiar RLS helpers a security invoker
-- ======================================================
-- El security definer con set search_path = public puede hacer que auth.uid()
-- retorne NULL en ciertos contextos (tablas nuevas, with check policies de RLS).
-- Al usar security invoker se hereda la sesión JWT del usuario autenticado.
--
-- Ejemplo de bug: pending_invitations policy usa with check (is_business_admin(...))
-- y auth.uid() retorna NULL, haciendo que la policy siempre falle.

create or replace function public.is_business_member(p_business_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select exists (
    select 1
    from public.businesses b
    where b.id = p_business_id
      and b.owner_id = (select auth.uid())
  )
  or exists (
    select 1
    from public.business_users bu
    where bu.business_id = p_business_id
      and bu.user_id = (select auth.uid())
  );
$$;

create or replace function public.is_business_admin(p_business_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select exists (
    select 1
    from public.businesses b
    where b.id = p_business_id
      and b.owner_id = (select auth.uid())
  )
  or exists (
    select 1
    from public.business_users bu
    where bu.business_id = p_business_id
      and bu.user_id = (select auth.uid())
      and bu.role in ('owner', 'admin')
  );
$$;
