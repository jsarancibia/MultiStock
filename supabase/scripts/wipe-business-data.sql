-- Borra solo datos ligados a negocios (productos, ventas, movimientos, alertas,
-- auditoría, categorías, proveedores, membresías). Conserva usuarios de Auth y public.profiles.
--
-- Supabase Dashboard → SQL Editor → ejecutar.
-- O remoto con psql / URI: npm run db:wipe:business (requiere psql en PATH; ver scripts/supabase-db-wipe.cjs).

BEGIN;

TRUNCATE TABLE public.businesses RESTART IDENTITY CASCADE;

COMMIT;
