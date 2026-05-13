-- MultiStock: permisos employee limitados en stock_alerts
-- ==========================================================
-- Antes: Members manage stock_alerts (for all - is_business_member)
--   → employee podía INSERT y DELETE
--
-- Después:
--   Members can view stock_alerts (SELECT - is_business_member)
--   Members can resolve stock_alerts (UPDATE - is_business_member)
--   Admin can insert stock_alerts (INSERT - is_business_admin)
--   Admin can delete stock_alerts (DELETE - is_business_admin)
--
-- Employee solo puede:
--   ✅ SELECT (ver alertas)
--   ✅ UPDATE resolved (marcar como resuelta)
--   ❌ INSERT (las alertas las genera el sistema)
--   ❌ DELETE (no puede borrar alertas)

do $$
begin
  if exists (select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'stock_alerts')
  then
    drop policy if exists "Members manage stock_alerts" on public.stock_alerts;

    create policy "Members can view stock_alerts"
      on public.stock_alerts for select
      to authenticated
      using (public.is_business_member(business_id));

    create policy "Members can resolve stock_alerts"
      on public.stock_alerts for update
      to authenticated
      using (public.is_business_member(business_id))
      with check (public.is_business_member(business_id));

    create policy "Admin can insert stock_alerts"
      on public.stock_alerts for insert
      to authenticated
      with check (public.is_business_admin(business_id));

    create policy "Admin can delete stock_alerts"
      on public.stock_alerts for delete
      to authenticated
      using (public.is_business_admin(business_id));
  end if;
end $$;
