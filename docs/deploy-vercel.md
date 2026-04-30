# Deploy en Vercel - MultiStock

Guía rápida para desplegar con Supabase.

## 1) Crear proyecto en Vercel

1. Importar repositorio.
2. Framework: **Next.js**.
3. Branch principal: `main`.

## 2) Variables de entorno necesarias

Definir en Vercel (Preview + Production):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Opcional para operaciones locales de migración:

- `SUPABASE_DB_URL` (no es obligatoria en Vercel runtime).

## 3) Configuración en Supabase Auth

En Supabase Dashboard > Auth > URL Configuration:

- Site URL: `https://TU-DOMINIO.vercel.app`
- Redirect URLs:
  - `https://TU-DOMINIO.vercel.app/**`
  - `https://*.vercel.app/**` (para previews)

## 4) Migraciones antes del deploy

En local, verificar estado:

- `npm run db:push`
- `npx supabase migration list --db-url "..."`

Asegurar que local y remoto estén alineadas.

## 5) Verificaciones posteriores al deploy

- Login / register / onboarding.
- Dashboard carga.
- Crear producto y movimiento.
- Registrar venta.
- Revisar alertas y auditoría.

## 6) Troubleshooting común

- Error de auth redirect: revisar Redirect URLs en Supabase.
- Error de datos vacíos: revisar que el usuario tenga negocio activo.
- Error de migraciones: ejecutar `npm run db:push` con DB URL válida.
