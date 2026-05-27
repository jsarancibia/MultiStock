# Changelog — MultiStock

## English · Español

> Bilingual changelog covering all features, fixes, and architectural improvements developed for the MultiStock SaaS inventory management platform.  
> Changelog bilingüe que cubre todas las funcionalidades, correcciones y mejoras arquitectónicas desarrolladas para la plataforma SaaS de control de inventario MultiStock.

---

## 1. Authentication & Roles · Autenticación y Roles

### Login, registro y onboarding
- Sistema completo de autenticación con Supabase Auth (login, registro, recuperación de sesión).
- Pantalla de onboarding para crear negocio, seleccionar rubro y configurar datos iniciales.
- **Fix:** login y registro vinculan invitaciones pendientes automáticamente al crear cuenta.
- **Fix:** vinculación de invitaciones antes del onboarding y después del `signIn` en `registerAction`.
- **Fix:** case‑insensitive email en invitaciones — vinculación automática corregida.

### Sistema de roles
- Implementación del sistema de roles: **Dueño (owner), Admin y Empleado (employee)**.
- Simplificación de roles: centralización del plan en `business`, ajuste de permisos `employee`.
- Protección de páginas por rol y corrección de RPC de ventas para empleados.
- Roles globales agregados al panel de administración.

### Login, registration & onboarding
- Full authentication system with Supabase Auth (login, registration, session recovery).
- Onboarding screen to create a business, select industry type, and set up initial data.
- **Fix:** login and registration automatically link pending invitations when creating accounts.
- **Fix:** invitation linking before onboarding and after `signIn` in `registerAction`.
- **Fix:** case‑insensitive email on invitations — automatic linking corrected.

### Role system
- Role system implemented: **Owner, Admin, and Employee**.
- Simplified roles: plan centralized in `business`, employee permissions adjusted.
- Role‑based page protection and sales RPC fix for employees.
- Global roles added to admin panel.

---

## 2. Products & Inventory · Productos e Inventario

### CRUD de productos
- Formulario de creación de productos con campos comunes y dinámicos por rubro usando `metadata` JSONB.
- **Refactor:** formulario rediseñado con margen visual y switches modernos (ToggleSwitch).
- **Feat:** paso de confirmación real con resumen, checklist y vista previa en el wizard.
- **Feat:** botón de eliminar producto (baja lógica).
- **Fix:** productos creados no aparecían en inventario por bug en parseo de `active`.
- **Fix:** reparación para productos creados con `active=false` por bug.

### Product CRUD
- Product creation form with common fields and industry‑specific dynamic fields via JSONB `metadata`.
- **Refactor:** redesigned form with visual margin indicator and modern ToggleSwitch components.
- **Feat:** real confirmation step with summary, checklist, and preview in the wizard.
- **Feat:** delete product button (logical deactivation).
- **Fix:** newly created products weren't showing in inventory due to `active` parsing bug.
- **Fix:** repair mechanism for products created with `active=false` due to a bug.

### Edición inline y detalle
- **Feat:** edición inline de proveedor, margen, precio y estado directamente en el listado.
- **Fix:** margen editable en vivo en el editor inline.
- **Style:** mejora visual de la tarjeta de margen en el editor inline.
- **Fix:** corrección de edición inline — faltaba revalidación y refresh del cliente.
- **Feat:** mejora en detalle de producto con botón "Volver" y ocultación de metadata raw.
- **Feat:** creación inline de proveedor, colapso de stock tras operación exitosa y mejoras en editor de productos.

### Inline editing & detail
- **Feat:** inline editing of supplier, margin, price, and status directly in the product list.
- **Fix:** live‑editable margin in the inline product editor.
- **Style:** visual improvement of the margin card in the inline editor.
- **Fix:** inline edit correction — missing revalidation and client refresh.
- **Feat:** product detail enhancement with "Back" button and hidden raw metadata.
- **Feat:** inline supplier creation, stock collapse after success, and product editor improvements.

### Movimientos de stock
- **Feat:** botón "Reducir stock" en inventario.
- **Feat:** botón "Agregar stock" con formulario de movimiento.
- Historial de movimientos de stock por producto.
- Restricción INSERT/UPDATE/DELETE de inventario a solo `owner` (RLS).
- **Fix:** oculta paso "Venta Rápida" del wizard en ferretería.

### Stock movements
- **Feat:** "Reduce stock" button in inventory.
- **Feat:** "Add stock" button with movement form.
- Stock movement history per product.
- INSERT/UPDATE/DELETE restriction on inventory to `owner` only (RLS).
- **Fix:** hidden "Quick Sale" step from wizard in hardware store flow.

---

## 3. Sales · Ventas

### Flujo de ventas
- Pantalla de nueva venta con búsqueda de productos, cálculo de subtotal y total.
- Registro de método de pago y descuento automático de stock al confirmar.
- **Feat:** soporte de peso decimal y flujo POS adaptable.
- **Feat:** enlace con celular en búsqueda de nueva venta.
- **Fix:** RPC de ventas, escáner en móvil y layout de nueva venta corregido.
- **Fix:** RPC `create_sale_with_items` con contexto de seguridad (`security definer`).

### Sales flow
- New sale screen with product search, subtotal, and total calculation.
- Payment method registration and automatic stock deduction upon confirmation.
- **Feat:** decimal weight support and adaptable POS flow.
- **Feat:** mobile link in new sale search.
- **Fix:** sales RPC, mobile scanner, and new sale layout corrected.
- **Fix:** `create_sale_with_items` RPC with security context (`security definer`).

### Visualización de ventas
- **Fix:** formato de hora en columna Fecha (`HH:mm:ss`, `hh:mm:ss AM/PM`, formato 24h).
- **Fix:** hora exacta sin conversión de zona horaria en la UI de ventas.
- Timezone `America/Santiago` aplicado a `formatSystemDateTime`.

### Sales display
- **Fix:** time format in Date column (`HH:mm:ss`, `hh:mm:ss AM/PM`, 24h format).
- **Fix:** exact time without timezone conversion in sales UI.
- Timezone `America/Santiago` applied to `formatSystemDateTime`.

---

## 4. Suppliers · Proveedores

- **Feat:** formulario y listado de proveedores.
- **Feat:** creación inline de proveedor desde el editor de productos.
- Tabla de proveedores con CRUD completo (crear, ver, editar).
- Formulario con validaciones Zod.
- Productos vinculables a proveedores.

- **Feat:** supplier form and listing.
- **Feat:** inline supplier creation from product editor.
- Full CRUD supplier table (create, view, edit).
- Form with Zod validations.
- Products linkable to suppliers.

---

## 5. Team & Invitations · Equipo e Invitaciones

### Gestión de equipo
- **Feat:** módulo de equipo (Team) visible en plan Free.
- **Fix:** `getBusinessRole` migrado de RPC a consulta directa.
- **Fix:** RLS policy agregada para leer perfiles de miembros del mismo negocio.
- **Feat:** confirmación antes de eliminar miembro del equipo.
- **Feat:** auditoría al eliminar miembro del equipo.
- **Fix:** uso de `maybeSingle` en `removeMemberAction` para evitar error si falta perfil.

### Team management
- **Feat:** Team module visible on Free plan.
- **Fix:** `getBusinessRole` migrated from RPC to direct query.
- **Fix:** RLS policy added to read member profiles within the same business.
- **Feat:** confirmation dialog before removing a team member.
- **Feat:** audit log when removing a team member.
- **Fix:** use of `maybeSingle` in `removeMemberAction` to avoid error when profile is missing.

### Invitaciones
- **Feat:** invitaciones para empleados sin cuenta — formulario + UI de pendientes.
- **Feat:** modal QR + compartir link al invitar empleado.
- **Fix:** `InviteMemberForm` se cierra y refresca tras invitación exitosa.
- **Fix:** muestra link de registro al invitar empleado (opción A).
- **Fix:** reemplazo de `toCanvas` por `toDataURL` para QR en navegador.
- **Fix:** migración `pending_invitations` autocontenida + logging + `registerAction` robusta.
- **Fix:** dependencia circular RLS y policy INSERT faltante corregida.

### Invitations
- **Feat:** invitations for employees without an account — form + pending UI.
- **Feat:** QR modal + share link when inviting an employee.
- **Fix:** `InviteMemberForm` closes and refreshes after successful invitation.
- **Fix:** registration link shown when inviting an employee (option A).
- **Fix:** `toCanvas` replaced by `toDataURL` for QR in browser.
- **Fix:** self‑contained `pending_invitations` migration + logging + robust `registerAction`.
- **Fix:** circular RLS dependency and missing INSERT policy corrected.

---

## 6. Reports & Excel Exports · Reportes y Exportaciones Excel

### Motor Excel empresarial
- Arquitectura modular del motor de reportes Excel (ExcelJS).
- **Generadores:** products, inventory, sales, movements, alerts.
- **Temas:** `corporate-blue`, `dark-professional`, `minimal-gray`, `multistock` (identidad MultiStock).
- **Core:** colores, condicionales, footer, helpers, imágenes, layout, print, estilos, summary, tablas, workbook.
- **Utils:** auto‑size, bordes, currency.

### Enterprise Excel engine
- Modular architecture for the Excel report engine (ExcelJS).
- **Generators:** products, inventory, sales, movements, alerts.
- **Themes:** `corporate-blue`, `dark-professional`, `minimal-gray`, `multistock` (MultiStock branding).
- **Core:** colors, conditionals, footer, helpers, images, layout, print, styles, summary, tables, workbook.
- **Utils:** auto‑size, borders, currency.

### Reportes exportables
- **Feat:** exportación Excel ERP con logo y plantilla unificada por categoría.
- **Feat:** CSV compatible con Excel.
- **Style:** personalización Excel con identidad visual MultiStock.
- **Feat:** rediseño con estructura empresarial (KPI summary cards, condicionales).
- **Fix:** corrección de duplicado visual y ajuste de logo.
- **Fix:** aplanar hoja de datos y mover KPIs a Resumen.
- **Fix:** estabilizar separadores y padding vertical en reportes.
- **Fix:** zona horaria corregida en reportes Excel.
- **Fix:** exportación de hora en formato `HH:mm:ss`.

### Exportable reports
- **Feat:** ERP‑grade Excel export with logo and unified template per category.
- **Feat:** Excel‑compatible CSV export.
- **Style:** MultiStock visual identity in Excel exports.
- **Feat:** redesign with enterprise structure (KPI summary cards, conditionals).
- **Fix:** visual duplication and logo adjustment.
- **Fix:** flatten data sheet and move KPIs to Summary.
- **Fix:** stabilize separators and vertical padding in reports.
- **Fix:** timezone correction in Excel reports.
- **Fix:** time export in `HH:mm:ss` format.

---

## 7. Plans & Pricing · Planes y Precios

- **Feat:** estructura completa de 4 planes SaaS: **Free, Pro, Super, Enterprise**.
- **Feat:** arquitectura final de planes con "Ilimitado Comercial".
- **Feat:** aplicación de niveles Gratis/Pro/Business en el producto.
- **Feat:** banner persuasivo de upgrade con barra de progreso.
- **Fix:** eliminación de estadísticas (productos, ventas, usuarios) de la página de precios — solo features y soporte.
- **Fix:** eliminación de stats de "fiado" de la página de precios.

- **Feat:** full 4‑tier SaaS plan structure: **Free, Pro, Super, Enterprise**.
- **Feat:** final plan architecture with "Unlimited Commercial".
- **Feat:** Free/Pro/Business plan levels applied to the product.
- **Feat:** persuasive upgrade banner with progress bar.
- **Fix:** removal of stats (products, sales, users) from pricing page — features and support only.
- **Fix:** removal of "fiado" stats from pricing page.

---

## 8. Admin Panel · Panel de Administración

- **Feat:** panel de administración global con rutas `/admin`.
- **Feat:** tabla de negocios (`admin/businesses`) y tabla de usuarios (`admin/users`).
- **Feat:** selector de plan por usuario y selector de rol por usuario en admin.
- **Feat:** botón "Ver planes" en admin panel y conexión de cambio de plan en tabla de negocios.
- **Fix:** eliminación del botón "Ver planes" del admin panel (ajuste final).

- **Feat:** global admin panel with `/admin` routes.
- **Feat:** business table (`admin/businesses`) and users table (`admin/users`).
- **Feat:** per‑user plan selector and per‑user role selector in admin.
- **Feat:** "View plans" button in admin panel and plan change connected to business table.
- **Fix:** removal of "View plans" button from admin panel (final adjustment).

---

## 9. Dashboard & Alerts · Dashboard y Alertas

- Dashboard general con tarjetas de métricas: stat cards, low‑stock panel, alert panel, recent activity.
- Top products panel, top categories panel, trend bars.
- Quick actions y task list en dashboard.
- Dashboard personalizado por rubro (almacén, ferretería, verdulería).
- Panel de alertas integrado en dashboard.
- Listado de alertas de stock con estados (resolved/unresolved).

- General dashboard with metric cards: stat cards, low‑stock panel, alert panel, recent activity.
- Top products panel, top categories panel, trend bars.
- Quick actions and task list on dashboard.
- Industry‑specific dashboards (warehouse, hardware store, greengrocer).
- Alert panel integrated into dashboard.
- Stock alerts list with statuses (resolved/unresolved).

---

## 10. UX / UI General

### Navegación y formularios
- **Feat:** wizard multi‑step en formularios (navegación Volver/Cancelar).
- **Feat:** reemplazo de checkboxes por componente `ToggleSwitch`.
- **Fix:** prevención de submit accidental con Enter en pasos del wizard.
- **Refactor:** integración del paso de configuración dentro del paso de confirmación.
- Unificación del botón Editar con la estética del sistema.
- **Fix:** navegación en auth, tema en marketing y limpieza de base de datos.
- Mensajes de error en español.

### Navigation & forms
- **Feat:** multi‑step wizard in forms (Back/Cancel navigation).
- **Feat:** checkbox replaced by `ToggleSwitch` component.
- **Fix:** accidental Enter submit prevention in wizard steps.
- **Refactor:** configuration step integrated into confirmation step.
- Unified Edit button with system aesthetics.
- **Fix:** navigation in auth, marketing theme, and database cleanup.
- Error messages in Spanish.

### Componentes UI propios
- Componentes base: `Button`, `EmptyState`, `ConfirmDialog`, `InlineError`, `PageErrorState`.
- `TableEmptyState`, `MetricCard`, `SimpleChartCard`, `StatusRing`, `ActionCard`.
- `WizardStepper`, `PageSurface`, `PageNavigation`, `BackButton`.
- `ToggleSwitch`, `FormMessage`, `ThemeToggle`.

### Custom UI components
- Base components: `Button`, `EmptyState`, `ConfirmDialog`, `InlineError`, `PageErrorState`.
- `TableEmptyState`, `MetricCard`, `SimpleChartCard`, `StatusRing`, `ActionCard`.
- `WizardStepper`, `PageSurface`, `PageNavigation`, `BackButton`.
- `ToggleSwitch`, `FormMessage`, `ThemeToggle`.

---

## 11. Marketing & Landing Page · Marketing y Página Principal

- **Feat:** eliminación de dependencia `shadcn/ui` y migración a componentes propios.
- Layout de sitio público con páginas: landing (`/`), demo (`/demo`), features (`/features`), pricing (`/pricing`).
- SEO mejorado con metadata actualizada.
- Componentes de marketing: `HeroActions`, `MarketingFooter`, `MarketingNav`.
- **Feat:** mockups de dashboard (`DashboardMockup`) y mini‑mocks de demo (`DemoMiniMocks`).

- **Feat:** removal of `shadcn/ui` dependency and migration to custom components.
- Public site layout with pages: landing (`/`), demo (`/demo`), features (`/features`), pricing (`/pricing`).
- Improved SEO with updated metadata.
- Marketing components: `HeroActions`, `MarketingFooter`, `MarketingNav`.
- **Feat:** dashboard mockups (`DashboardMockup`) and demo mini‑mocks (`DemoMiniMocks`).

---

## 12. Contact & Communication · Contacto y Comunicación

- **Feat:** botones `mailto` y correo de contrataciones en página de precios, footer y banner.
- **Fix:** cambio de `mailto` por enlace directo a Gmail web.
- **Fix:** `target="_blank"` en enlaces Gmail y cuerpo del mensaje con datos del negocio.

- **Feat:** `mailto` buttons and hiring email on pricing page, footer, and banner.
- **Fix:** `mailto` changed to direct Gmail web link.
- **Fix:** `target="_blank"` on Gmail links and message body with business data.

---

## 13. Audit Log · Auditoría

- **Feat:** tabla de auditoría (`audit_logs`) con registro de acciones críticas.
- **Feat:** registro de auditoría al eliminar miembro del equipo.
- Página `/auditoria` con tabla de logs (`AuditTable`).

- **Feat:** audit log table (`audit_logs`) for recording critical actions.
- **Feat:** audit log entry when removing a team member.
- `/auditoria` page with audit log table (`AuditTable`).

---

## 14. Barcode Scanner · Lector de Códigos de Barras

- **Feat:** escaneo continuo de códigos en nueva venta.
- **Feat:** escaneo con celular vía QR y mejoras en ventas y escáner.
- **Feat:** lector de códigos responsive.
- **Feat:** componente `HidBarcodeListener` para lectores HID (USB).
- **Feat:** normalización de códigos de barras.
- Página dedicada `/escanear-codigo` para escaneo en móvil.

- **Feat:** continuous barcode scanning in new sale flow.
- **Feat:** mobile phone scanning via QR and improvements in sales and scanner.
- **Feat:** responsive barcode reader.
- **Feat:** `HidBarcodeListener` component for HID (USB) scanners.
- **Feat:** barcode normalization.
- Dedicated `/escanear-codigo` page for mobile scanning.

---

## 15. Architecture & Documentation · Arquitectura y Documentación

### Arquitectura del proyecto
- **Core SaaS:** autenticación, usuarios, negocios, roles, configuración.
- **Core de Inventario:** productos, categorías, proveedores, stock, movimientos, ventas, alertas.
- **Módulos por rubro:** `almacen/`, `ferreteria/`, `verduleria/` con dashboard cards y product fields personalizados.
- **UI Personalizada:** layouts, formularios dinámicos, navegación por rubro.

### Project architecture
- **SaaS Core:** authentication, users, businesses, roles, configuration.
- **Inventory Core:** products, categories, suppliers, stock, movements, sales, alerts.
- **Industry modules:** `almacen/`, `ferreteria/`, `verduleria/` with custom dashboard cards and product fields.
- **Custom UI:** layouts, dynamic forms, industry‑specific navigation.

### Documentación
- 35+ documentos de arquitectura en `docs/arquitectura/`.
- Documentación de planes comerciales, release checklist, demo data, deploy en Vercel.
- Resumen completo del proyecto (`resumen-completo.md`).
- Documentación del motor Excel (`excel-engine.md`).
- Sistema de usuarios documentado (`SISTEMA-USUARIOS.md`).

### Documentation
- 35+ architecture documents in `docs/arquitectura/`.
- Commercial plans documentation, release checklist, demo data, Vercel deployment guide.
- Full project summary (`resumen-completo.md`).
- Excel engine documentation (`excel-engine.md`).
- User system documented (`SISTEMA-USUARIOS.md`).

---

## 16. Security & RLS · Seguridad y Row Level Security

### Base de datos y RLS
- **Feat:** RLS aplicado a todas las tablas operativas (`business_id`).
- **Fix:** RLS para dueños de negocio y mensajes de error en español.
- **Fix:** RLS helpers migrados de `security definer` a `invoker`.
- **Fix:** migración RLS para `pending_invitations` SELECT por email.
- **Feat:** restricción INSERT/UPDATE/DELETE de inventario a solo `owner`.
- **Feat:** restricción de stock alerts para empleados.
- 22 migraciones de Supabase (esquema, índices, funciones, políticas RLS).

### Database & RLS
- **Feat:** RLS applied to all operational tables (`business_id`).
- **Fix:** RLS for business owners and Spanish error messages.
- **Fix:** RLS helpers migrated from `security definer` to `invoker`.
- **Fix:** RLS migration for `pending_invitations` SELECT by email.
- **Feat:** INSERT/UPDATE/DELETE restriction on inventory to `owner` only.
- **Feat:** stock alerts restriction for employees.
- 22 Supabase migrations (schema, indexes, functions, RLS policies).

---

## 17. Tech Stack · Stack Técnico

| Layer · Capa | Technology · Tecnología |
|---|---|
| Frontend Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Backend / DB | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Forms | React Hook Form + Zod |
| Tables | TanStack Table v8 |
| Charts | Recharts |
| Excel Engine | ExcelJS v4 |
| QR Codes | `qrcode` |
| Barcode Scanner | `@zxing/browser` |
| Theming | `next-themes` |
| Notifications | Sonner |
| UI Primitives | `@base-ui/react` + custom components |
| Deploy | Vercel |

---

## 18. Summary Statistics · Estadísticas Generales

| Metric · Métrica | Count · Cantidad |
|---|---|
| Total commits · Commits totales | 91 |
| Supabase migrations · Migraciones | 22 |
| App route pages · Páginas de ruta | 30+ |
| Components · Componentes | 107+ |
| Library modules · Módulos de librería | 50+ |
| Zod validations · Validaciones Zod | 9 |
| Excel report themes · Temas Excel | 5 |
| Excel report generators · Generadores Excel | 5 |
| Business types · Rubros | 3 (almacén, ferretería, verdulería) |
| SaaS plans · Planes SaaS | 4 (Free, Pro, Super, Enterprise) |
| Architecture docs · Docs de arquitectura | 35+ |
| DB migrations · Migraciones BD | 22 |

---

## 19. Features by Business Type · Funcionalidades por Rubro

| Feature · Funcionalidad | Almacén | Ferretería | Verdulería |
|---|---|---|---|
| Product CRUD · CRUD productos | ✅ | ✅ | ✅ |
| Barcode · Código de barras | ✅ | ✅ | ✅ |
| Weight sale · Venta por peso | ❌ | ❌ | ✅ |
| Margin management · Márgenes | ✅ | ❌ | ❌ |
| Technical specs · Especificaciones técnicas | ❌ | ✅ | ❌ |
| Brand & model · Marca y modelo | ❌ | ✅ | ❌ |
| Perishable tracking · Perecibles | ❌ | ❌ | ✅ |
| Waste tracking · Merma | ❌ | ❌ | ✅ |
| Quick sale bypass · Sin venta rápida | ❌ | ✅ | ❌ |
| Custom dashboard · Dashboard personalizado | ✅ | ✅ | ✅ |
| Custom product fields · Campos extra | ✅ | ✅ | ✅ |

---

**MultiStock** — *Simple, professional, and scalable inventory management for small businesses.*  
*Control de inventario simple, profesional y escalable para pequeños negocios.*
