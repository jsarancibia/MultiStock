# QA Fase 15 - Demo y Release

Checklist operativo para validar MultiStock antes de demo o despliegue.

## 1) Flujo funcional end-to-end

- [ ] Registro de usuario (`/auth/register`).
- [ ] Login (`/auth/login`).
- [ ] Onboarding y creación de negocio (`/onboarding`).
- [ ] Dashboard carga sin errores (`/dashboard`).
- [ ] Crear categoría desde `Productos`.
- [ ] Crear proveedor desde `Proveedores`.
- [ ] Crear producto y editar precio/stock mínimo.
- [ ] Registrar movimiento de stock.
- [ ] Registrar venta y validar descuento de stock.
- [ ] Revisar alertas y marcar una como resuelta.
- [ ] Revisar auditoría (`/auditoria`): alta producto, movimiento, venta, alerta resuelta.

## 2) Pruebas por rubro

### Verdulería
- [ ] Productos por kg y por unidad.
- [ ] Producto perecible (`is_perishable`).
- [ ] Venta por peso (`allows_weight_sale`).
- [ ] Movimiento de merma.

### Almacén
- [ ] Producto de alta rotación (`fast_rotation`).
- [ ] Producto con margen sugerido.
- [ ] Búsqueda por SKU/código de barras.
- [ ] Filtro por foco comercial.

### Ferretería
- [ ] Producto con marca/modelo/medida.
- [ ] Búsqueda técnica por marca o medida.
- [ ] Producto técnico en alerta de stock.

## 3) Multi-tenant y seguridad

- [ ] Todas las pantallas muestran solo datos del `business_id` activo.
- [ ] RLS activo en tablas core + `audit_logs`.
- [ ] No se exponen datos de otro negocio.

## 4) UX de robustez

- [ ] Error boundaries activos en dashboard/productos/inventario/ventas/proveedores/alertas.
- [ ] Loaders por ruta principal visibles.
- [ ] Mensajes de formulario y acciones son comprensibles (sin stack técnico).

## 5) Calidad técnica

- [ ] `npm run lint` sin errores.
- [ ] `npm run build` pasa.
- [ ] Migraciones locales y remotas alineadas (`supabase migration list`).

## 6) Release readiness

- [ ] Variables en Vercel cargadas.
- [ ] Supabase Auth Redirect URLs configuradas.
- [ ] Deploy en preview validado con navegador limpio.
- [ ] Checklist de demo completado con datos realistas.
