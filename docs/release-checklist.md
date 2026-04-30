# Release Checklist - MultiStock

Checklist de salida para demo o producción inicial.

## A. Base técnica

- [ ] `npm run lint` sin errores.
- [ ] `npm run build` exitoso.
- [ ] Migraciones Supabase aplicadas.
- [ ] `supabase migration list` alineado (local = remote).

## B. Base de datos y seguridad

- [ ] RLS activo en tablas core y `audit_logs`.
- [ ] Consultas filtradas por `business_id`.
- [ ] No se exponen datos entre negocios.

## C. Flujos críticos

- [ ] Registro y login.
- [ ] Onboarding y creación de negocio.
- [ ] Alta/edición/desactivación de producto.
- [ ] Movimiento de stock.
- [ ] Venta completa.
- [ ] Resolución de alerta.
- [ ] Auditoría visible en `/auditoria`.

## D. UX y robustez

- [ ] Error boundaries funcionan en rutas principales.
- [ ] Loaders por módulo visibles.
- [ ] Mensajes de error entendibles para usuarios finales.

## E. Capa pública (marketing)

- [ ] Landing `/` clara en menos de 10 segundos.
- [ ] `/features`, `/pricing`, `/demo` navegables.
- [ ] CTAs a login/registro visibles.

## F. Deploy Vercel

- [ ] Variables de entorno cargadas:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Auth Redirect URLs en Supabase configuradas.
- [ ] Validación en preview y en producción.

## G. Post-release

- [ ] Registrar feedback de la demo.
- [ ] Anotar bugs críticos y no críticos.
- [ ] Priorizar backlog de siguiente fase.
