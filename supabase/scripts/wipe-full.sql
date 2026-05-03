-- Vacía tablas de negocio y elimina todas las cuentas de Auth (y perfiles en cascada).
-- Úsalo solo en desarrollo o cuando quieras resetear por completo el proyecto.
--
-- Supabase Dashboard → SQL Editor → ejecutar.
-- O remoto con psql / URI: npm run db:wipe:full (requiere psql en PATH; ver scripts/supabase-db-wipe.cjs).

BEGIN;

TRUNCATE TABLE public.businesses RESTART IDENTITY CASCADE;

DELETE FROM auth.users;

COMMIT;
