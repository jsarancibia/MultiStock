-- Borra solo datos ligados a negocios (productos, ventas, movimientos, alertas,
-- auditoría, categorías, proveedores, membresías). Conserva usuarios de Auth y public.profiles.
--
-- Supabase Dashboard → SQL Editor → ejecutar.

BEGIN;

TRUNCATE TABLE public.businesses RESTART IDENTITY CASCADE;

COMMIT;
