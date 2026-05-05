-- Promover un usuario a admin.
-- Uso: reemplaza TU_EMAIL por el email con que iniciaste sesión.
-- Ejecutar en: Supabase Dashboard → SQL Editor

update public.profiles
set role = 'admin'
where lower(trim(email)) = lower(trim('multistock@gmail.com'));

-- Verificar resultado:
select id, email, role, plan, created_at
from public.profiles
where lower(trim(email)) = lower(trim('multistock@gmail.com'));
