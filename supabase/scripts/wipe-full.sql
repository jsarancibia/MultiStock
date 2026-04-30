-- Vacía tablas de negocio y elimina todas las cuentas de Auth (y perfiles en cascada).
-- Úsalo solo en desarrollo o cuando quieras resetear por completo el proyecto.
--
-- Supabase Dashboard → SQL Editor → ejecutar.

BEGIN;

TRUNCATE TABLE public.businesses RESTART IDENTITY CASCADE;

DELETE FROM auth.users;

COMMIT;
