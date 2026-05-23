-- MultiStock: rompe dependencia circular en RLS de business_users SELECT
-- =========================================================================
-- Problema: is_business_member (security invoker) consulta business_users
-- internamente, y la policy SELECT de business_users llama a is_business_member,
-- creando un ciclo recursivo que PostgreSQL corta devolviendo vacío.
--
-- Resultado: los empleados (cuya membresía solo existe en business_users) no
-- pueden leer su propia fila → listUserBusinesses retorna [] →
-- getActiveBusiness retorna null → redirect a /onboarding en vez del negocio.
--
-- Los dueños no se ven afectados porque is_business_member tiene un camino
-- alternativo por businesses.owner_id sin circularidad.
--
-- Solución: agregar user_id = auth.uid() como condición directa en la policy,
-- evaluada por PostgreSQL sin consultar tablas (sin recursión). El OR con
-- is_business_member se mantiene para que dueños lean filas de otros miembros.

-- 1. Reemplazar policy SELECT de business_users
drop policy if exists "Members can read business user rows in their org" on public.business_users;

create policy "Members can read business user rows in their org"
  on public.business_users for select
  to authenticated
  using (
    user_id = auth.uid()
    or public.is_business_member(business_id)
  );

-- 2. Verificar que el INSERT sigue intacto (ya usa user_id = auth.uid() sin circularidad)
-- La policy "Invited users can accept pending invitation" de 20260522000000 no se modifica.
