# Resumen completo de MultiStock

> Documento generado el 2026-05-18. Revisión profunda de toda la plataforma: estructura, funcionalidades, modelo de datos, planes, roles, diferencias por rubro y componentes UI. Sirve como referencia para identificar qué falta, qué se puede mejorar o qué agregar.

---

## Índice

1. [Visión general y stack técnico](#1-visión-general-y-stack-técnico)
2. [Estructura del proyecto](#2-estructura-del-proyecto)
3. [Modelo de datos (Supabase / PostgreSQL)](#3-modelo-de-datos-supabase--postgresql)
4. [Planes de suscripción y límites](#4-planes-de-suscripción-y-límites)
5. [Autenticación, roles y equipo](#5-autenticación-roles-y-equipo)
6. [Módulo de Productos](#6-módulo-de-productos)
7. [Módulo de Ventas](#7-módulo-de-ventas)
8. [Módulo de Inventario / Stock](#8-módulo-de-inventario--stock)
9. [Módulo de Proveedores](#9-módulo-de-proveedores)
10. [Módulo de Alertas](#10-módulo-de-alertas)
11. [Módulo de Dashboard](#11-módulo-de-dashboard)
12. [Módulo de Reportes y Exportaciones](#12-módulo-de-reportes-y-exportaciones)
13. [Módulo de Auditoría](#13-módulo-de-auditoría)
14. [Panel de Administración Global](#14-panel-de-administración-global)
15. [Diferencias por tipo de negocio](#15-diferencias-por-tipo-de-negocio)
16. [UI / Layout / Navegación](#16-ui--layout--navegación)
17. [Sistema de códigos de barras](#17-sistema-de-códigos-de-barras)
18. [Motor de reportes Excel](#18-motor-de-reportes-excel)
19. [Onboarding y creación de negocio](#19-onboarding-y-creación-de-negocio)
20. [Páginas públicas (Marketing / Site)](#20-páginas-públicas-marketing--site)
21. [Feature flags](#21-feature-flags)
22. [Observaciones y posibles mejoras](#22-observaciones-y-posibles-mejoras)

---

## 1. Visión general y stack técnico

**MultiStock** es una aplicación web SaaS de control de inventario para pequeños negocios en Chile. Es multi-tenant, modular y especializada por rubro (verdulería, almacén, ferretería).

### Stack tecnológico

| Componente | Tecnología |
|------------|-----------|
| **Framework** | Next.js 16.2.4 (App Router) |
| **Lenguaje** | TypeScript 5, React 19.2.4 |
| **Estilos** | Tailwind CSS v4 (configuración vía CSS, sin tailwind.config) |
| **Backend / BD** | Supabase (PostgreSQL) |
| **Autenticación** | Supabase Auth (solo email/contraseña, sin OAuth) |
| **Validación** | Zod v4 + @hookform/resolvers |
| **Estado del frontend** | Server Components + Server Actions + useActionState |
| **Tablas de datos** | @tanstack/react-table |
| **Gráficos** | Recharts |
| **Iconos** | Lucide React |
| **Excel** | ExcelJS |
| **Código de barras** | @zxing/browser |
| **QR** | qrcode |
| **Notificaciones** | Sonner (toast) |
| **Modo oscuro** | next-themes |
| **Path alias** | `@/` → raíz del proyecto |
| **Monorepo** | No, proyecto único privado |

### Scripts principales

| Script | Comando |
|--------|---------|
| `dev` | `next dev` |
| `build` | `next build` |
| `db:push` | Script node para migraciones |
| `db:wipe:business` | Limpia datos de un negocio |
| `db:wipe:full` | Limpia toda la BD |

### Variables de entorno (`.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=https://xwhmqtdoyqeevaqfinep.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_DB_URL=postgresql://...
NEXT_PUBLIC_SALES_EMAIL=multistock.dev@gmail.com
```

---

## 2. Estructura del proyecto

```
MultiStock/
├── app/                         # Next.js App Router
│   ├── (app)/                   # Dashboard privado (requiere auth)
│   │   ├── admin/               #   Panel admin global
│   │   ├── alertas/             #   Alertas de stock
│   │   ├── auditoria/           #   Auditoría
│   │   ├── dashboard/           #   Dashboard principal
│   │   ├── equipo/              #   Gestión de equipo
│   │   ├── exportaciones/       #   Exportaciones CSV/Excel
│   │   ├── inventario/          #   Inventario y movimientos
│   │   ├── productos/           #   CRUD de productos
│   │   ├── proveedores/         #   Proveedores
│   │   ├── reportes/            #   Reportes simples
│   │   └── ventas/              #   Ventas y detalle
│   ├── (site)/                  # Sitio público (marketing)
│   │   ├── demo/
│   │   ├── features/
│   │   └── pricing/
│   ├── api/exportaciones/[report]/excel/  # API Excel
│   ├── auth/login|register/     # Login y registro
│   ├── escanear-codigo/         # Página escáner mobile
│   ├── onboarding/              # Creación de negocio
│   ├── globals.css              # Tailwind v4 + variables
│   └── layout.tsx               # Layout raíz
├── components/
│   ├── admin/                   # Admin tables
│   ├── alertas/                 # Stock alerts list
│   ├── auditoria/               # Audit table
│   ├── auth/                    # Auth shell/card/benefits
│   ├── barcode/                 # Scanner, HID, mobile link
│   ├── billing/                 # Upgrade banner, upgrade required
│   ├── brand/                   # Logo, favicon sync
│   ├── dashboard/               # Metrics cards, panels, trend
│   ├── forms/                   # Login, register, onboarding, category, supplier
│   ├── inventario/              # Stock table, movements
│   ├── layout/                  # AppShell, Header, Sidebar, Switcher
│   ├── marketing/               # Nav, footer, hero, mockups
│   ├── productos/               # Product form (wizard), table, sections
│   ├── providers/               # ThemeProvider
│   ├── team/                    # Team members, invitations
│   ├── ui/                      # Button, MetricCard, WizardStepper, etc.
│   └── ventas/                  # Sale form, cart, search, summary
├── config/
│   ├── brand-assets.ts          # Logos y favicons
│   ├── business-types.ts        # Tipos de negocio y módulos
│   ├── feature-flags.ts         # Feature flags
│   ├── locale.ts                # es-CL, CLP
│   ├── navigation.ts            # Módulos e items de navegación
│   └── plans.ts                 # Planes, límites y helpers
├── docs/                        # Documentación (arquitectura, planes, etc.)
├── lib/
│   ├── audit/                   # createAuditLog
│   ├── auth/                    # Session, actions, roles, admin checks
│   ├── barcode/                 # Normalize, HID hook
│   ├── billing/                 # Plan guards, quotas, banners, module access
│   ├── business/                # Active business, type config, sale config, metrics
│   ├── hooks/                   # useBeforeUnload
│   ├── products/                # Map product for sale
│   ├── reports/                 # Export queries, stock status, Excel engine
│   ├── supabase/                # Clients (browser, server, admin)
│   └── validations/             # Zod schemas (auth, product, sale, etc.)
├── modules/
│   ├── admin/                   # Server actions admin
│   ├── almacen/                 # Product fields, dashboard cards
│   ├── core/                    # Server actions por módulo
│   ├── ferreteria/              # Product fields, dashboard cards
│   └── verduleria/              # Product fields, dashboard cards
├── public/brand/                # Logos y favicons estáticos
├── supabase/
│   ├── migrations/              # 19 migraciones SQL
│   ├── scripts/                 # Wipe, promote admin
│   ├── config.toml
│   └── seed.sql
└── types/database.ts            # Tipos TypeScript de BD
```

---

## 3. Modelo de datos (Supabase / PostgreSQL)

### 3.1 Listado de migraciones (19 totales)

| # | Archivo | Propósito |
|---|---------|-----------|
| 01 | `20260424200000_init_multitenant_core.sql` | Tablas core, RLS, funciones |
| 02 | `20260426103000_create_sale_with_items_function.sql` | Función RPC de venta atómica |
| 03 | `20260427120000_create_audit_logs.sql` | Tabla de auditoría |
| 04 | `20260429120000_idx_products_business_barcode.sql` | Índice parcial de barcode |
| 05 | `20260503003000_allow_business_owner_in_rls_helpers.sql` | Owner en RLS |
| 06 | `20260503120000_fix_create_sale_with_items_postgrest_arg_order.sql` | Fix orden args RPC |
| 07 | `20260505120000_add_business_subscription_plan.sql` | Columna subscription_plan |
| 08 | `20260506120000_add_global_roles_and_profile_plan.sql` | profiles.role, profiles.plan |
| 09 | `20260510120000_add_future_proof_employee_roles.sql` | Roles legacy → nuevos |
| 10 | `20260510130000_fix_create_sale_security_definer.sql` | SECURITY DEFINER |
| 11 | `20260510140000_simplify_business_roles.sql` | Simplifica a owner/employee |
| 12 | `20260510150000_restrict_employee_stock_alerts.sql` | Restringe empleados |
| 13 | `20260513180000_pending_invitations.sql` | Tabla de invitaciones |
| 14 | `20260514000000_fix_rls_helpers_invoker.sql` | RLS invoker |
| 15 | `20260514100000_fix_pending_invitations_rls.sql` | Fix RLS invitaciones |
| 16 | `20260514200000_invite_acceptance_policies.sql` | Políticas de aceptación |
| 17 | `20260514210000_restrict_employee_inventory_inserts.sql` | Restringe inserts empleados |
| 18 | `20260515000000_add_super_enterprise_plans.sql` | Planes Super y Enterprise |
| 19 | `20260516000000_fix_team_profile_rls.sql` | Lectura perfiles compañeros |

### 3.2 Tablas del esquema público

#### `profiles`
Vinculada 1:1 con `auth.users`. Creada automáticamente por trigger.

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | `uuid PK` | FK → `auth.users` |
| `full_name` | `text` | nullable |
| `email` | `text` | nullable |
| `role` | `text` | `'admin'` o `'user'` (rol global) |
| `plan` | `text` | **Deprecated.** Usar `businesses.subscription_plan` |
| `created_at` | `timestamptz` | |
| `updated_at` | `timestamptz` | |

#### `businesses`
Tabla central multi-tenant.

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | `uuid PK` | |
| `owner_id` | `uuid FK` | → `profiles` |
| `name` | `text` | |
| `business_type` | `text` | `verduleria` / `almacen` / `ferreteria` |
| `subscription_plan` | `text` | `free` / `pro` / `super` / `enterprise` |
| `created_at` | `timestamptz` | |
| `updated_at` | `timestamptz` | |

#### `business_users`
Membresías de usuarios a negocios.

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | `uuid PK` | |
| `business_id` | `uuid FK` | → `businesses` |
| `user_id` | `uuid FK` | → `profiles` |
| `role` | `text` | `owner` / `employee` |
| `created_at` | `timestamptz` | |
| **Unique** | | `(business_id, user_id)` |

#### `categories`

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | `uuid PK` | |
| `business_id` | `uuid FK` | → `businesses` |
| `name` | `text` | |
| `business_type` | `text` | nullable |

#### `suppliers`

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | `uuid PK` | |
| `business_id` | `uuid FK` | → `businesses` |
| `name` | `text` | |
| `phone` | `text` | nullable |
| `email` | `text` | nullable |
| `address` | `text` | nullable |

#### `products`

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | `uuid PK` | |
| `business_id` | `uuid FK` | → `businesses` |
| `category_id` | `uuid FK` | → `categories` (nullable) |
| `supplier_id` | `uuid FK` | → `suppliers` (nullable) |
| `name` | `text` | |
| `sku` | `text` | nullable |
| `barcode` | `text` | nullable, índice parcial |
| `unit_type` | `text` | `unit` / `kg` / `g` / `box` / `liter` / `meter` |
| `cost_price` | `numeric(14,4)` | |
| `sale_price` | `numeric(14,4)` | |
| `min_stock` | `numeric(14,4)` | |
| `current_stock` | `numeric(14,4)` | |
| `business_type` | `text` | |
| `metadata` | `jsonb` | Datos específicos por rubro |
| `active` | `boolean` | |
| `created_at` | `timestamptz` | |
| `updated_at` | `timestamptz` | |

**Metadata por rubro:**

| Rubro | Campos en metadata |
|-------|-------------------|
| **Verdulería** | `is_perishable`, `expiration_days`, `allows_weight_sale`, `waste_tracking`, `fast_rotation`, `pinned` |
| **Almacén** | `fast_rotation`, `pinned` |
| **Ferretería** | `brand`, `model`, `material`, `measure`, `technical_specs`, `fast_rotation`, `pinned` |

#### `stock_movements`

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | `uuid PK` | |
| `business_id` | `uuid FK` | |
| `product_id` | `uuid FK` | |
| `type` | `text` | `purchase` / `sale` / `adjustment` / `waste` / `return` / `initial_stock` |
| `quantity` | `numeric(14,4)` | Negativo para ventas/salidas |
| `reason` | `text` | nullable |
| `unit_cost` | `numeric(14,4)` | nullable |
| `created_by` | `uuid` | nullable |

#### `sales`

| Columna | Tipo |
|---------|------|
| `id` | `uuid PK` |
| `business_id` | `uuid FK` |
| `total` | `numeric(14,4)` |
| `payment_method` | `text` | `cash` / `debit` / `credit` / `transfer` / `other` |
| `created_by` | `uuid` | nullable |
| `created_at` | `timestamptz` |

#### `sale_items`

| Columna | Tipo |
|---------|------|
| `id` | `uuid PK` |
| `sale_id` | `uuid FK` → `sales` |
| `product_id` | `uuid FK` → `products` |
| `quantity` | `numeric(14,4)` |
| `unit_price` | `numeric(14,4)` |
| `subtotal` | `numeric(14,4)` |

#### `stock_alerts`

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | `uuid PK` | |
| `business_id` | `uuid FK` | |
| `product_id` | `uuid FK` | |
| `type` | `text` | `low_stock` / `out_of_stock` / `perishable_warning` / `waste_warning` |
| `message` | `text` | |
| `resolved` | `boolean` | |
| `created_at` | `timestamptz` | |

#### `audit_logs`

| Columna | Tipo |
|---------|------|
| `id` | `uuid PK` |
| `business_id` | `uuid FK` |
| `user_id` | `uuid` | nullable |
| `entity_type` | `text` | `product` / `stock_movement` / `sale` / `supplier` / `category` / `stock_alert` / `business` |
| `entity_id` | `uuid` | nullable |
| `action` | `text` | `created` / `updated` / `deleted` / `deactivated` / `stock_changed` / `price_changed` / `sale_confirmed` / `alert_resolved` |
| `summary` | `text` | |
| `before_data` | `jsonb` | nullable |
| `after_data` | `jsonb` | nullable |
| `metadata` | `jsonb` | nullable |
| `created_at` | `timestamptz` | |

#### `pending_invitations`

| Columna | Tipo |
|---------|------|
| `id` | `uuid PK` |
| `business_id` | `uuid` |
| `email` | `text` |
| `role` | `text` | `'employee'` |
| `invited_by` | `uuid` |
| `created_at` | `timestamptz` |
| **Unique** | `(business_id, email)` |

### 3.3 Funciones SQL

| Función | Propósito |
|---------|-----------|
| `set_updated_at()` | Trigger genérico: asigna `updated_at = now()` |
| `handle_new_user()` | Trigger AFTER INSERT en `auth.users`: crea fila en `profiles` |
| `is_business_member(uuid)` | ¿Usuario es miembro del negocio? (invoker) |
| `is_business_admin(uuid)` | ¿Usuario es owner/admin del negocio? (invoker) |
| `get_business_role(uuid)` | Devuelve rol del usuario en el negocio (definer) |
| `get_business_member_ids()` | IDs de compañeros de negocio (definer, migración 19) |
| `create_sale_with_items(uuid, uuid, jsonb, text)` | Venta atómica con descuento de stock y alertas (SECURITY DEFINER) |

### 3.4 Resumen RLS por rol

| Tabla | Owner | Employee |
|-------|-------|----------|
| profiles | propio + compañeros | propio + compañeros |
| businesses | CRUD | SELECT |
| business_users | CRUD | SELECT |
| categories | CRUD | SELECT |
| suppliers | CRUD | SELECT |
| products | CRUD | SELECT |
| stock_movements | CRUD | SELECT |
| sales | CRUD | INSERT + SELECT |
| sale_items | CRUD | INSERT + SELECT |
| stock_alerts | CRUD | SELECT + UPDATE (resolve) |
| audit_logs | SELECT + INSERT | nada |
| pending_invitations | SELECT (propias + negocio) | SELECT (propias) |

---

## 4. Planes de suscripción y límites

Definidos en `config/plans.ts`.

### 4.1 Tabla de planes

| Plan | Precio | Productos | Ventas/mes | Movs Stock/mes | Miembros | Clientes fiado | Scanner móvil |
|------|--------|-----------|-----------|----------------|----------|---------------|--------------|
| **Free** | $0 | 50 | 100 | 100 | 1 | 0 | No |
| **Pro** | $14.990/mes | 500 | ∞ | 1.000 | 2 | 10 | Sí |
| **Super** | $24.990/mes | 1.000 | ∞ | ∞ | 4 | 100 | Sí |
| **Enterprise** | $34.990/mes | 50.000* | ∞ | ∞ | 100* | 50.000* | Sí |

*\* Límite técnico, en UI se muestra como "Ilimitado".*

### 4.2 Módulos por plan

| Módulo | Free | Pro | Super | Enterprise |
|--------|------|-----|-------|------------|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Products | ✅ | ✅ | ✅ | ✅ |
| Inventory | ✅ | ✅ | ✅ | ✅ |
| Sales | ✅ | ✅ | ✅ | ✅ |
| Alerts | ✅ | ✅ | ✅ | ✅ |
| Team | ✅ | ✅ | ✅ | ✅ |
| Suppliers | ❌ | ✅ | ✅ | ✅ |
| Audit | ❌ | ✅ | ✅ | ✅ |
| Reports | ❌ | ✅ | ✅ | ✅ |
| Exports | ❌ | ✅ | ✅ | ✅ |

### 4.3 Helpers de planes

| Helper | Función |
|--------|---------|
| `normalizePlan(plan)` | Normaliza plan, mapea `business` → `super` |
| `isEffectivelyUnlimited(plan, resource)` | `true` solo para Enterprise en products/members/creditCustomers |
| `isTopTier(plan)` | `true` solo para Enterprise |
| `canUseModule(plan, module)` | Verifica si el plan tiene el módulo |
| `canUseMobileScanner(plan)` | Disponible desde Pro |
| `getPlanLimits(plan)` | Retorna límites del plan |

### 4.4 Guardas de límites (`lib/billing/plan-guards.ts`)

| Guarda | Qué verifica |
|--------|-------------|
| `canBusinessUseModule(business, module)` | Módulo disponible según plan |
| `assertProductLimit` | Productos activos vs límite |
| `assertMonthlySalesLimit` | Ventas del mes calendario |
| `assertMonthlyStockMovementLimit` | Movimientos de stock del mes |
| `assertMemberLimit` | Miembros en business_users |
| `getModuleUpgradeMessage` | Mensaje de upgrade contextual |

### 4.5 Cuotas (`lib/billing/get-quota.ts`)

- `getProductQuota(business)` → cuota actual/máximo con `isNearLimit`, `isAtLimit`
- `getMemberQuota(business)` → igual para miembros

### 4.6 Upgrade path

`free → pro → super → enterprise` (Enterprise no tiene upgrade). Cada paso muestra: nombre, precio, lista de beneficios. Botón de contratar abre Gmail con template de datos comerciales.

---

## 5. Autenticación, roles y equipo

### 5.1 Tipos de rol

| Capa | Tipo | Valores | Dónde se almacena |
|------|------|---------|-------------------|
| **Global (sistema)** | `GlobalRole` | `admin` / `user` | `profiles.role` |
| **Business (negocio)** | `BusinessRole` | `owner` / `employee` | `business_users.role` + `businesses.owner_id` |
| **Plan (suscripción)** | `SubscriptionPlan` | `free` / `pro` / `super` / `enterprise` | `businesses.subscription_plan` |

### 5.2 Flujo de autenticación

- **Proveedor único**: email/contraseña (sin OAuth, sin confirmación de email)
- **No hay `middleware.ts`**: la protección se hace desde Server Components
- **No hay ruta `/auth/callback`**: la confirmación está deshabilitada en Supabase

**Login**: `signInWithPassword` → vincula invitaciones pendientes → redirect a dashboard u onboarding.
**Registro**: `signUp` → auto-login inmediato → vincula invitaciones → redirect a onboarding.
**Logout**: `signOut` → redirect a `/auth/login`.

### 5.3 Clientes Supabase (3 capas)

| Cliente | Archivo | Uso |
|---------|---------|-----|
| Browser | `lib/supabase/client.ts` | Componentes cliente |
| Server | `lib/supabase/server.ts` | Server Components (sesión) + service_role |
| Admin | `lib/supabase/admin.ts` | Service role (bypass RLS) |

### 5.4 Protectores

| Función | Archivo | Comportamiento |
|---------|---------|----------------|
| `getCurrentUser()` | `lib/auth/session.ts` | Retorna usuario o null |
| `requireUser()` | `lib/auth/session.ts` | Redirect a login si no hay sesión |
| `requireActiveBusiness(userId)` | `lib/business/get-active-business.ts` | Redirect a onboarding si no hay negocio |
| `requirePageAccess(roles)` | `lib/auth/require-page-access.ts` | Redirect a dashboard si no tiene rol |
| `requireBusinessRole(roles)` | `lib/auth/require-business-role.ts` | Throws error si no autorizado (uso en Server Actions) |
| `requireAdmin()` | `lib/auth/is-admin.ts` | Redirect a `/` si no es admin global |

### 5.5 Multi-negocio (Business Switcher)

- Un usuario puede ser miembro de varios negocios (como owner y/o employee)
- `listUserBusinesses()` consulta `business_users` + `businesses` donde es owner
- Cookie `multistock_active_business_id` guarda el negocio activo (30 días, httpOnly)
- `BusinessSwitcher` en el header permite cambiar de negocio

### 5.6 Equipo e invitaciones

**Solo accesible para rol `owner`.** Funcionalidades:

| Acción | Server Action |
|--------|--------------|
| Listar miembros | `listTeamMembers()` |
| Invitar por email | `inviteMemberAction()` |
| Cancelar invitación | `cancelInvitationAction()` |
| Eliminar miembro | `removeMemberAction()` |

**Flujo de invitación:**
1. Owner ingresa email
2. Si ya tiene cuenta (`profiles`): crea vínculo directo en `business_users`
3. Si no tiene cuenta: guarda en `pending_invitations` y genera QR/enlace de registro
4. Al registrarse/login, `linkPendingInvitationsForUser()` vincula automáticamente

**Componentes UI de equipo:** `TeamPage`, `TeamMemberRow`, `InviteMemberForm`, `ShareInviteModal` (QR + enlace), `CancelInvitationButton`.

### 5.7 Restricción de navegación por rol

En `app/(app)/layout.tsx`:
- **Employee**: solo ve Dashboard, Productos, Inventario, Ventas
- **Owner**: ve todos los módulos habilitados por plan

---

## 6. Módulo de Productos

### 6.1 Server Actions (`modules/core/products/actions.ts`)

| Acción | Rol | Descripción |
|--------|-----|-------------|
| `listProducts(filters)` | autenticado | Lista con filtros: búsqueda, categoría, proveedor, estado, focus |
| `getProductById(id)` | autenticado | Detalle con joins |
| `findActiveProductByBarcode(code)` | autenticado | Doble búsqueda (exacta + ILIKE) |
| `getProductFormData()` | autenticado | Business + categories + suppliers |
| `createProductAction` | owner | Wizard completo con validación, límites y metadata |
| `updateProductAction` | owner | Actualización con auditoría de cambios |
| `deactivateProductAction` | owner | Desactiva producto |
| `quickUpdateProductAction` | owner | Edición inline (supplier, precio, estado) |
| `toggleProductActiveAction` | owner | Toggle activo/inactivo |
| `deleteProductAction` | owner | Borrado permanente |

### 6.2 Validaciones (`lib/validations/product.ts`)

- `productSchema`: name (2+), categoryId, supplierId, sku, barcode (normalizado), unitType, costPrice, salePrice, minStock, currentStock, active, businessType, metadata
- `superRefine`: para verdulería SKU/barcode opcionales; para almacén y ferretería al menos uno obligatorio
- `productFiltersSchema`: q, categoryId, supplierId, status, focus
- `quickProductUpdateSchema`: supplierId, salePrice, costPrice, active

### 6.3 Wizard de creación (`components/productos/product-form.tsx`)

**Modo rápido** (Toggle): datos básicos + precio + stock en una sola página.
**Modo completo** (WizardStepper):

| Paso | Componente | Contenido |
|------|-----------|-----------|
| 1. Datos básicos | `ProductBasicSection` | Nombre, unidad, categoría (con creación inline), proveedor, SKU, barcode |
| 2. Precio y stock | `ProductPricingSection` | Costo, venta (con tarjeta de margen dinámico), stock actual, stock mínimo |
| 3. Venta rápida* | `ProductQuickSaleSection` | Alta rotación, acceso rápido en ventas (solo almacén/verdulería) |
| 4. Confirmación | `ProductConfigSection` + `ProductConfirmSection` | Campos de rubro + resumen completo con snapshot |

*\*Paso 3 oculto para ferretería (`QUICK_SALE_BUSINESS_TYPES = ["almacen", "verduleria"]`)*

**Características del wizard:**
- `useBeforeUnload` si hay cambios sin guardar
- Enter avanza al siguiente paso (no submit)
- Botón "Guardar y crear otro" con `intent=create_another`
- Validación pre-submit client-side

### 6.4 Componentes de formulario

- **`ProductBasicSection`**: inputs con soporte de escáner de barras
- **`ProductPricingSection`**: margen visual en tiempo real `((venta - costo) / costo * 100)`
- **`ProductQuickSaleSection`**: toggles `fast_rotation` y `pinned`
- **`ProductConfigSection`**: acordeón que renderiza campos específicos por rubro
- **`ProductRubroFields`**: delega en módulo específico según `business_type`
- **`ProductConfirmSection`**: snapshot de formData, checklist visual
- **`ProductBarcodeField`**: input + escáner (cámara, mobile, HID) con key de reseteo

### 6.5 Tabla de productos (`components/productos/products-table.tsx`)

- **Columnas base**: Nombre (con badge de rubro), Unidad, Precio venta, Stock actual, SKU, Código
- **Columnas extra por rubro**:
  - **Verdulería**: Unidad / rubro (badge "peso" si `allows_weight_sale`)
  - **Almacén**: Margen (% sobre costo)
  - **Ferretería**: Técnico (marca · modelo · medida)
- Badges inline: "perecible" (verdulería), "rotacion" (almacén)
- Edición inline (owner): supplier, estado, precio venta, precio costo
- Empleados: solo visualización (sin editar/eliminar)
- `ConfirmDialog` para eliminación

### 6.6 Páginas

| Ruta | Rol | Descripción |
|------|-----|-------------|
| `/productos` | autenticado | Lista con filtros + banner plan |
| `/productos/nuevo` | owner | Wizard de creación |
| `/productos/[id]` | autenticado | Detalle + botones editar/desactivar |
| `/productos/[id]/editar` | owner | Wizard de edición (sin editar stock inicial) |

---

## 7. Módulo de Ventas

### 7.1 Server Actions (`modules/core/sales/actions.ts`)

| Acción | Rol | Descripción |
|--------|-----|-------------|
| `listSales()` | autenticado | Lista ventas con items, orden descendente |
| `getSaleById(saleId)` | autenticado | Detalle con items y datos de producto |
| `getSaleFormData()` | autenticado | Productos activos mapeados (ordenados para almacén) |
| `createSaleAction` | owner/employee | Venta con items (JSON), validación, límite mensual, RPC atómico |

### 7.2 Flujo de venta (create_sale_with_items RPC)

1. Validación Zod: `paymentMethod` + `items[]`
2. `assertMonthlySalesLimit` (plan Free: 100/mes)
3. Fetch de productos, validación individual (existencia, activo, stock)
4. Llamada RPC `create_sale_with_items(business_id, user_id, items_json, payment_method)`
5. La función SQL (SECURITY DEFINER): inserta sale, sale_items, descuenta stock, crea stock_movement, sincroniza alertas, hace FOR UPDATE lock
6. Audit log con total y método de pago

### 7.3 Formulario de venta (`components/ventas/sale-form.tsx`)

**Estado local**: `items: SaleCartItem[]`, `paymentMethod`, `clientError`, `isDirty`

**Componentes:**

| Componente | Función |
|-----------|---------|
| `ProductSearch` | Búsqueda con scoring (almacén), escáner 3 vías, detección automática de barcode |
| `QuickProductButtons` | Grid de botones para productos `pinned` (solo verdulería) |
| `SaleItemsTable` | Tabla/cards responsive, input de cantidad con constraints por unidad |
| `SaleSummary` | Selector de método de pago + total CLP |

**Atajos**: Ctrl+K enfoca búsqueda, tecla "N" abre nueva venta.
**`useBeforeUnload`** si hay cambios sin guardar.

### 7.4 Configuración de venta por rubro (`lib/business/sale-config.ts`)

| Propiedad | Verdulería | Almacén | Ferretería |
|-----------|-----------|---------|------------|
| Botones rápidos | ✅ Sí | ❌ No | ❌ No |
| AutoFocus búsqueda | ❌ No | ✅ Sí | ✅ Sí |
| Placeholder | "Buscar por nombre (banana, tomate...)" | "Código de barras, SKU o nombre del producto" | "SKU, marca, medida o nombre del artículo" |
| Hint cantidades | ✅ Decimales (kg, litros) | ❌ | ❌ |
| weightStep | 0.5 | 1 | 1 |

### 7.5 Páginas

| Ruta | Descripción |
|------|-------------|
| `/ventas` | Lista histórica con totales y método de pago |
| `/ventas/nueva` | Formulario (o empty state si no hay productos) |
| `/ventas/[id]` | Detalle con items, botones a nueva venta / historial |

---

## 8. Módulo de Inventario / Stock

### 8.1 Server Actions

**`modules/core/inventory/actions.ts`:**
- `listInventoryProducts()`: productos activos ordenados alfabéticamente
- `listLowStockProducts()`: productos con `current_stock <= min_stock`

**`modules/core/inventory/agregar-stock-action.ts`:**
- `agregarStockRapidoAction`: carga rápida desde tabla (tipo "purchase", motivo "Carga rápida desde inventario")

**`modules/core/stock-movements/actions.ts`:**

| Acción | Rol | Descripción |
|--------|-----|-------------|
| `createStockMovement(input)` | interno | Función genérica que maneja delta según tipo |
| `createStockMovementAction` | owner | Wrapper de formulario |
| `listStockMovements(productId?)` | autenticado | Lista movimientos |
| `getMovementFormData()` | autenticado | Productos activos para selector |

### 8.2 Tipos de movimiento

| Tipo | Delta | Descripción |
|------|-------|-------------|
| `initial_stock` | +abs | Carga inicial |
| `purchase` | +abs | Compra |
| `adjustment` | literal | Corrección (±) |
| `waste` | -abs | Merma |
| `return` | +abs | Devolución |
| `sale` | (manejado por RPC) | Venta |

### 8.3 Sincronización de alertas

`syncLowStockAlert()` se dispara después de cada movimiento:
- Si `currentStock <= minStock` y no hay alerta sin resolver → crea `low_stock`
- Si ya no está bajo stock → resuelve alerta existente
- También sincroniza alerta de perecedero para verdulería (`syncPerishableProductAlert`)

### 8.4 Componentes

| Componente | Descripción |
|-----------|-------------|
| `StockTable` | Productos con stock, min_stock, código, historial + agregar inline |
| `AgregarStockButton` | Mini-formulario inline que se despliega al hacer clic |
| `StockMovementForm` | Selector de producto + tipo + cantidad + resumen en vivo |
| `MovementsTable` | Fecha, producto, tipo, cantidad, costo, motivo |

### 8.5 Páginas

| Ruta | Rol | Descripción |
|------|-----|-------------|
| `/inventario` | autenticado | Stock con contador de bajo stock |
| `/inventario/movimientos` | autenticado | Todos los movimientos |
| `/inventario/movimientos/nuevo` | owner | Formulario de movimiento |
| `/inventario/productos/[id]/movimientos` | autenticado | Movimientos de un producto |

---

## 9. Módulo de Proveedores

- **Disponible desde plan Pro** (getPlanModuleAccess)
- **Server Actions**: `listSuppliers`, `getSupplierById`, `createSupplierAction`, `updateSupplierAction`
- **Validación** (`supplierSchema`): name (2+), phone (max 40), email, address (max 240)
- **Páginas**: lista (`/proveedores`), crear (`/proveedores/nuevo`), editar (`/proveedores/[id]/editar`)
- **Solo owner** puede acceder

---

## 10. Módulo de Alertas

### 10.1 Tipos de alerta

| Tipo | Disparo | Descripción |
|------|---------|-------------|
| `low_stock` | Automático al crear/actualizar stock | Stock actual ≤ mínimo |
| `out_of_stock` | Automático | Stock = 0 |
| `perishable_warning` | Al crear producto perecible (verdulería) | Producto perecible activo |
| `waste_warning` | Automático | Merma detectada |

### 10.2 Funcionalidad

- `listStockAlerts()`: todas las alertas del negocio con join a producto
- `resolveStockAlertAction`: marca como resuelta + audit log
- Tabla con: fecha, producto (stock actual/mínimo), tipo, mensaje, estado (resuelta/pendiente), acción

### 10.3 Páginas

| Ruta | Descripción |
|------|-------------|
| `/alertas` | Lista completa de alertas |

---

## 11. Módulo de Dashboard

### 11.1 Métricas principales (18 campos)

La función `getDashboardMetrics(business)` ejecuta **15 consultas en paralelo** a Supabase:

| Métrica | Origen | Descripción |
|---------|--------|-------------|
| `activeProducts` | products | Conteo active=true |
| `lowStock` | products | Con `current_stock <= min_stock` |
| `salesTodayCount` | sales | Ventas del día |
| `salesTodayTotal` | sales | Suma total del día |
| `recentMovementsCount` | stock_movements | Últimos 7 días |
| `pendingAlertsCount` | stock_alerts | No resueltas |
| `estimatedCapital` | products | Σ(current_stock × cost_price) |
| `trend` | sales + movements | 7 días (ventas $ + movimientos count) |
| `topProducts` | sale_items | Top 5 por revenue (30 días) |
| `topCategories` | products | Top 4 por cantidad |
| `recentActivity` | movements + sales | Últimas 8 acciones combinadas |
| `lowStockPreview` | products | Top 6 con mayor déficit |
| `alertPreview` | stock_alerts | Últimas 5 no resueltas |
| `verduleria.*` | products + movements | Perecibles, merma, ventas por peso |
| `almacen.*` | products | Alta rotación, margen promedio |
| `ferreteria.*` | products + movements | Sin movimiento 30d, categoría top, técnicos bajo mínimo |

### 11.2 Componentes del dashboard

| Componente | Ubicación | Descripción |
|-----------|-----------|-------------|
| MetricCard (8x) | Fila 1 y 2 | 4 el panel (hoy/7d/activos/alertas) y 4 info (capital/bajo mínimo/movimientos/saludable) |
| TrendBars | Columna izquierda | Barras apiladas: ventas $ (verde) + movimientos count (gris) 7 días |
| TopProductsPanel | Columna izquierda | Top 5 productos más vendidos |
| TopCategoriesPanel | Columna derecha | Top 4 categorías (barras de progreso) |
| TaskListCard | Columna derecha | 3 tareas sugeridas |
| LowStockPanel | Fila 3 | Productos bajo mínimo con enlace |
| AlertPanel | Fila 3 | Alertas pendientes con severidad |
| RecentActivity | Fila 3 | Últimas acciones (ventas + movimientos) |
| DashboardQuickActions | Arriba | 4 accesos directos |
| Cards de rubro | Abajo | 2-3 StatCards específicas del rubro |

### 11.3 Dashboard por rubro

Se renderizan condicionalmente al final del dashboard:
- **Verdulería**: perecibles activos, merma 7d, líneas vendidas por peso 30d
- **Almacén**: alta rotación activos, margen promedio
- **Ferretería**: estancados 30d, categoría top, referencias técnicas bajo mínimo

---

## 12. Módulo de Reportes y Exportaciones

### 12.1 Reportes simples (`/reportes`)

- Disponible desde plan Pro
- 4 tarjetas en grid 2×2:
  - Ventas por día (top 7)
  - Productos más vendidos (top 7)
  - Productos bajo stock (top 7)
  - Movimientos y merma (top 7 días)

### 12.2 Exportaciones (`/exportaciones`)

5 categorías con descarga CSV y Excel:

| Categoría | Columnas CSV | Columnas Excel |
|-----------|-------------|----------------|
| Productos | 8 (código, descripción, unidad, categoría, precio, estado, SKU, barcode) | 8 |
| Inventario | 10 (nombre, SKU, barcode, stock_actual, stock_mínimo, unidad, estado_stock*, solicitar*, categoría) | 10 |
| Movimientos | 4 (fecha, tipo, cantidad, motivo) | 4 |
| Ventas | 3 (fecha, total, método_pago) | 3 |
| Alertas | 4 (fecha, tipo, mensaje, estado) | 4 |

*\* `estado_stock` y `solicitar` se calculan con funciones en `lib/reports/inventory-stock-status.ts`.*

### 12.3 API Excel

`GET /api/exportaciones/[report]/excel` genera archivo .xlsx con:
- Tema visual según reporte (multistock, corporate-blue, minimal-gray, dark-professional)
- Header corporativo, summary cards (KPIs), tabla con autofilter y stripes, footer
- Formato condicional programático

---

## 13. Módulo de Auditoría

- **Solo owner, disponible desde Pro**
- Cada acción sensible registra: `entity_type`, `action`, `summary`, `before_data`, `after_data`
- `listAuditLogs(limit=200)`: últimos registros con join a `profiles(email)`
- `AuditTable`: columnas Fecha, Usuario, Tipo (con labels en español), Acción, Detalle

### Eventos auditados

| Acción | Entity types |
|--------|-------------|
| `created` | product, supplier, category, stock_movement |
| `updated` | product, supplier, category |
| `deleted` | product, supplier, category |
| `deactivated` | product |
| `stock_changed` | stock_movement |
| `price_changed` | product |
| `sale_confirmed` | sale |
| `alert_resolved` | stock_alert |

---

## 14. Panel de Administración Global

- **Requiere rol `admin` en `profiles.role`**
- Rutas bajo `app/(app)/admin/`

### Dashboard admin (`/admin`)

Tarjetas: Total usuarios, Total negocios, Negocios Free/Pro/Super/Enterprise, Últimos 5 usuarios registrados.

### Gestión de usuarios (`/admin/users`)

Tabla con: email, rol, creado, selector de rol (`user`/`admin`). No permite quitar el último admin.

### Gestión de negocios (`/admin/businesses`)

Tabla con: nombre, email del dueño, rubro, plan, creado. Selector de plan por owner (`free`/`pro`/`super`/`enterprise`).

### Server Actions admin

| Acción | Descripción |
|--------|-------------|
| `getUsers()` | Lista profiles con admin client |
| `getBusinesses()` | Negocios con email del owner |
| `getAdminDashboard()` | Métricas resumen |
| `updateUserRole(userId, role)` | Cambia rol global (protege último admin) |
| `updateUserPlan(userId, plan)` | Cambia plan del negocio del owner |

---

## 15. Diferencias por tipo de negocio

### 15.1 Tabla comparativa general

| Área | Verdulería | Almacén | Ferretería |
|------|-----------|---------|------------|
| **Campos extra en producto** | Venta por peso, perecible, merma, vida útil | Sin campos extra (usa venta rápida) | Marca, modelo, material, medida, especs técnicas |
| **Módulo exclusivo** | waste (merma) | margins (márgenes) | technical_specs |
| **SKU/Barcode obligatorio** | ❌ Opcional | ✅ Obligatorio | ✅ Obligatorio |
| **Wizard producto (pasos)** | 4 pasos (incluye venta rápida) | 4 pasos (incluye venta rápida) | 3 pasos (sin venta rápida) |
| **Botones rápidos en ventas** | ✅ Sí (pinned) | ❌ No | ❌ No |
| **AutoFocus búsqueda ventas** | ❌ No | ✅ Sí | ✅ Sí |
| **Búsqueda en ventas incluye** | Nombre, SKU, código | Scoring: código > SKU > nombre | Nombre, SKU, código + marca/modelo/medida |
| **weightStep** | 0.5 (decimal) | 1 (entero) | 1 (entero) |
| **Dashboard cards extra** | Perecibles, merma, ventas por peso | Alta rotación, margen promedio | Estancados, categoría top, técnicos bajo mínimo |
| **Filtros de producto** | Perecibles | Alta rotación, margen bajo | Sin movimiento 30d |
| **Badges en tabla productos** | "perecible" | "rotacion" | — |
| **Columna extra en tabla** | Unidad / rubro | Margen | Técnico (marca·modelo·medida) |
| **Búsqueda de productos (texto)** | name, sku, barcode | name, sku, barcode | name, sku, barcode + brand, model, measure |
| **Alertas automáticas extra** | Perecible por vencimiento | — | — |
| **Orden ventas** | Alfabético | Fast rotation primero | Alfabético |

### 15.2 Campos de metadata por rubro

```typescript
// Verdulería
metadata = {
  is_perishable: boolean,      // ¿Es perecible?
  expiration_days: number,     // Vida útil en días
  allows_weight_sale: boolean, // ¿Se vende por peso?
  waste_tracking: boolean,     // ¿Controla merma?
  fast_rotation: boolean,      // ¿Alta rotación?
  pinned: boolean              // ¿Botón rápido en ventas?
}

// Almacén
metadata = {
  fast_rotation: boolean,      // ¿Alta rotación?
  pinned: boolean              // ¿Botón rápido en ventas?
}

// Ferretería
metadata = {
  brand: string,               // Marca
  model: string,               // Modelo
  material: string,            // Material
  measure: string,             // Medida
  technical_specs: string,     // Especificaciones técnicas
  fast_rotation: boolean,
  pinned: boolean
}
```

### 15.3 Módulos habilitados por rubro

| Módulo | Verdulería | Almacén | Ferretería |
|--------|-----------|---------|------------|
| products | ✅ | ✅ | ✅ |
| inventory | ✅ | ✅ | ✅ |
| sales | ✅ | ✅ | ✅ |
| suppliers | ✅ | ✅ | ✅ |
| waste | ✅ | ❌ | ❌ |
| margins | ❌ | ✅ | ❌ |
| technical_specs | ❌ | ❌ | ✅ |

### 15.4 Dashboard específico

Verdulería:

| Card | Métrica | Ícono |
|------|---------|-------|
| Productos perecibles (activos) | `verduleria.perishableCount` | Apple |
| Merma reciente (7 días) | `verduleria.wasteRecentQty` | Trash2 |
| Líneas vendidas por peso (30d) | `verduleria.weightSaleLines30d` | Weight |

Almacén:

| Card | Métrica | Ícono |
|------|---------|-------|
| Alta rotación (activos) | `almacen.fastRotationCount` | TrendingUp |
| Margen promedio (sobre costo) | `almacen.avgMarginPercent` | Percent |

Ferretería:

| Card | Métrica | Ícono |
|------|---------|-------|
| Con stock, sin movimiento 30d | `ferreteria.staleCount` | Clock |
| Categoría con más SKU | `ferreteria.categoryTop` | Folder |
| Ref. técnicas bajo mínimo | `ferreteria.lowStockTechnicalCount` | Wrench |

---

## 16. UI / Layout / Navegación

### 16.1 Layout raíz (`app/layout.tsx`)

- Fuentes: Geist (sans) + Geist Mono, inyectadas como variables CSS
- `ThemeProvider` (next-themes) con `defaultTheme="light"`, `enableSystem={false}`
- `ThemeFaviconSync` sincroniza favicon según tema claro/oscuro
- Toaster (sonner) top-right, richColors, 4500ms

### 16.2 Dashboard shell (`app/(app)/layout.tsx`)

Estructura:
```
<AppShell>
  <AppHeader>        ← Logo, nombre, tipo, email, badge, switcher, theme toggle, avatar, logout
  <AppSidebar>       ← Navegación vertical (desktop) / horizontal (mobile)
  <main>             ← Contenido scrollable
</AppShell>
```

**Filtrado de navegación por rol:**
- Employee: solo dashboard, products, inventory, sales
- Owner: todos los módulos del plan
- Admin global: + "Admin Panel"

### 16.3 AppShell

- `h-dvh`, `flex-col`, scroll solo en `<main>`
- Desktop: sidebar + main en fila (`md:flex-row`)
- Mobile: todo apilado vertical
- Main: `bg-muted/30 dark:bg-background`

### 16.4 AppHeader

- `bg-card/95 backdrop-blur-sm`, `shadow-sm`, `border-b`
- Logo + nombre + tipo + email (truncados)
- Badge "Operación activa" (verde)
- BusinessSwitcher, ThemeToggle, avatar + logout

### 16.5 AppSidebar

- **Paleta oscura**: `bg-[#2b1b16]` (marrón) / `dark:bg-[#15100e]`
- **Ítem activo**: `bg-amber-400 text-stone-950`
- **Ítem inactivo**: `text-stone-200/85 hover:bg-white/10`
- **Íconos**: Lucide (LayoutDashboard, Boxes, ClipboardList, Receipt, Truck, AlertTriangle, BarChart3, Store, Users, Shield)
- Badge rojo de alertas no resueltas
- Mobile: nav horizontal con scroll; Desktop: `max-w-[18rem] lg:max-w-[20rem]`

### 16.6 Componentes UI principales

| Componente | Descripción |
|-----------|-------------|
| `Button` | Variants: default, outline, secondary, ghost, destructive, link. Sizes: xs a lg + icon |
| `ToggleSwitch` | Label + track animado con peer-checked |
| `MetricCard` | 5 tones (default, success/warning/danger/info) con icono y helper |
| `WizardStepper` | Desktop: pasos circulares con check. Mobile: barra de progreso |
| `ConfirmDialog` | Base UI AlertDialog, backdrop blur, variante destructive |
| `EmptyState` | Icono + título + descripción + acción |
| `ActionCard` | Link card con hover arrow, icono ámbar |
| `SimpleChartCard` | Card con título + descripción + children |
| `PageSurface` | Card redondeada con backdrop blur |
| `PageErrorState` | Pantalla de error con retry |
| `StatusRing` | SVG circular con porcentaje (color según nivel) |
| `TaskListCard` | Lista de tareas con iconos check |
| `FormMessage` | Mensajes error/success/info con role=alert |

### 16.7 Formularios (clases compartidas)

Definidas en `components/ui/form-field-styles.ts`:
- `panelInputClass`, `panelSelectClass`: h-9, border-input, bg-background
- `panelInputCompactClass`: h-9 w-28 (para tablas)
- `formSectionClass`: rounded-xl border bg-card p-3 md:p-4
- `formShellClass`: rounded-2xl border bg-card p-4 md:p-5 space-y-5

### 16.8 Navegación

Definida en `config/navigation.ts`:
- 10 módulos: dashboard, products, inventory, sales, suppliers, alerts, audit, reports, exports, team
- `getEnabledModules(businessType)`: filtra módulos habilitados por rubro
- `getNavigationForBusinessType(type, plan)`: filtra además por plan

### 16.9 Responsive

- Todos los componentes usan `sm:`, `md:`, `lg:` breakpoints
- Sidebar se aplana horizontalmente en mobile
- Header apila acciones en wrap
- Tablas se convierten a cards en mobile

---

## 17. Sistema de códigos de barras

### 17.1 3 métodos de entrada

| Método | Componente | Uso |
|--------|-----------|-----|
| **Cámara** | `BarcodeScanner` | Escáner fullscreen con ZXing |
| **Enlace mobile** | `MobileBarcodeLink` | QR que abre página de escaneo en el celular vía Supabase Broadcast |
| **Lector HID** | `HidBarcodeListener` | Detecta lecturas rápidas de escáner USB/Bluetooth |

### 17.2 Componentes

| Componente | Descripción |
|-----------|-------------|
| `BarcodeScanner` | Portal fullscreen, cámara trasera, modo single/continuo, deduplicación 900ms |
| `BarcodeScanButton` | Botón simple que abre el escáner |
| `MobileBarcodeLink` | Modal con QR + sesión Realtime Broadcast |
| `MobileBarcodeScannerPage` | Página `/escanear-codigo?session=X` que recibe código desde el celular |
| `HidBarcodeListener` | Botón toggle, feedback visual, auto-dismiss |

### 17.3 Normalización

`lib/barcode/normalize.ts`:
- `normalizeBarcode`: quita espacios, guiones, zero-width chars, pasa a mayúsculas
- `isValidBarcodeFormat`: regex `^[A-Z0-9]{6,32}$`

### 17.4 Integración

- En formulario de producto: `ProductBarcodeField` con los 3 métodos
- En ventas: `ProductSearch` detecta códigos automáticamente
- En movimientos de stock: selector con `BarcodeScanButton`

---

## 18. Motor de reportes Excel

### 18.1 Arquitectura

```
lib/reports/excel/
├── core/
│   ├── workbook.ts       ← Orquestador: buildReportBuffer, buildMultiSheetBuffer
│   ├── styles.ts         ← StyleSet temático
│   ├── tables.ts         ← Header, datos, autofilter, conditional
│   ├── layout.ts         ← Header corporativo, freeze pane
│   ├── summary.ts        ← KPIs entre header y tabla
│   ├── footer.ts         ← Footer corporativo
│   ├── helpers.ts        ← API de alto nivel
│   ├── print.ts          ← Config impresión (landscape, A4)
│   ├── conditional.ts    ← Formato condicional programático
│   ├── colors.ts         ← Paleta brand
│   └── images.ts         ← Logo
├── generators/
│   ├── products-report.ts
│   ├── inventory-report.ts
│   ├── movements-report.ts
│   ├── sales-report.ts
│   └── alerts-report.ts
├── themes/
│   ├── index.ts
│   ├── multistock.ts         ← Verde corporativo #2E7C51
│   ├── corporate-blue.ts     ← Azul #2E74B5
│   ├── dark-professional.ts  ← Charcoal #2D3748
│   └── minimal-gray.ts       ← Gris #5F6368
└── utils/
    ├── autosize.ts
    ├── currency.ts
    └── borders.ts
```

### 18.2 Pipeline de generación

1. Crear workbook con metadatos (creator = email, company = businessName)
2. Cargar logo PNG (falla silenciosamente si no existe)
3. Por cada sheet: resolver tema → StyleSet → header → summary → tabla con stripes → conditional → freeze pane → footer → print config
4. Serializar a Buffer

### 18.3 Formato condicional

Sistema programático con operadores: `lt`, `lte`, `gt`, `gte`, `eq`, `neq`, `contains`, `startsWith`. Cada regla tiene `columnKey`, condiciones evaluadas en orden.

Ejemplo: estado=Pendiente → ámbar, estado=Resuelta → verde.

---

## 19. Onboarding y creación de negocio

### 19.1 Flujo

1. Usuario se registra → auto-login → redirige a `/onboarding`
2. Página de onboarding con layout de 2 columnas:
   - Izquierda: instrucciones + checklist inicial (5 pasos)
   - Derecha: formulario de creación
3. `OnboardingForm`: nombre del negocio + tipo (radio con 3 rubros)
4. `createBusinessAction`:
   - Crea negocio en `businesses`
   - Asigna `owner` en `business_users`
   - Redirige a `/dashboard`

### 19.2 Página de onboarding

- Logo + "MultiStock" grande
- "Primer recorrido sugerido" (5 pasos numerados)
- "Checklist inicial" (5 items)
- "Paso 1 de 1: datos básicos del negocio"

---

## 20. Páginas públicas (Marketing / Site)

### 20.1 Landing page (`/`)

7 secciones:

1. **Hero**: H1 + descripción + CTA + DashboardMockup con glow
2. **Problemas**: 4 cards (stock desordenado, ventas sin trazabilidad, reposición tarde, info dispersa)
3. **Cómo funciona**: 6 pasos numerados
4. **Beneficios**: 4 cards con hover (inventario simple, ventas rápidas, alertas, panel por rubro)
5. **Rubros**: 3 `ProductSceneCard` con gradientes y tags
6. **Módulos**: 6 cards (productos, inventario, ventas, proveedores, alertas, reportes)
7. **Incluye vs Próximamente**: Grid 2 columnas con items
8. **CTA final**: "Empieza a ordenar tu stock hoy"

### 20.2 Pricing (`/pricing`)

- 4 planes en grid `sm:grid-cols-2 lg:grid-cols-4`
- Plan destacado con borde primary
- Cada tarjeta: nombre, precio, tag, descripción, features (✓), limitations (✗)
- Botón "Contratar" → Gmail con template de datos comerciales prellenado
- Banner: "Sin facturación electrónica / DTE aún. Paga vía transferencia."

### 20.3 Features (`/features`)

8 feature cards: productos, inventario, ventas, proveedores, alertas, dashboard, reportes, escáner. Cada una con ícono + descripción.

### 20.4 Demo (`/demo`)

4 pasos con mockups visuales: panel de control, productos e inventario, nueva venta, alertas.

### 20.5 MarketingNav

- Sticky, `bg-background/80 backdrop-blur-md`
- Desktop: logo + enlaces + login/register/kill
- Mobile: grid 2 columnas de botones

### 20.6 MarketingFooter

- `border-t`, `mt-auto`
- Logo + tagline + enlaces (Características, Precios, Demo, Contacto, Ingresar)
- Copyright: `© {year} MultiStock. Hecho para negocios en Chile.`

---

## 21. Feature flags

Definidos en `config/feature-flags.ts`:

| Flag | Default | Descripción |
|------|---------|-------------|
| `reports_v1` | ✅ true | Reportes simples |
| `exports_csv_v1` | ✅ true | Exportaciones CSV |
| `multi_business_switcher_v1` | ✅ true | Switcher de negocios |
| `audit_visible_v1` | ✅ true | Auditoría visible |
| `cash_simple_v2` | ❌ false | Caja simple v2 |
| `branches_v2` | ❌ false | Sucursales v2 |
| `cafeteria_v2` | ❌ false | Cafetería v2 |
| `plans_v3` | ❌ false | Planes v3 |
| `invitations_v3` | ❌ false | Invitaciones v3 |

---

## 22. Observaciones y posibles mejoras

### 22.1 Funcionalidades no implementadas (futuro)

Basado en feature flags inactivos y lo que no se encontró en el código:

| Funcionalidad | Estado | Notas |
|--------------|--------|-------|
| **Facturación electrónica / DTE** | No implementado | Mencionado como "próximamente" en landing |
| **Sistema de caja (cash_simple_v2)** | No implementado | Feature flag `false` |
| **Múltiples sucursales (branches_v2)** | No implementado | Feature flag `false` |
| **Módulo cafetería (cafeteria_v2)** | No implementado | Feature flag `false` |
| **Pagos en línea / Stripe** | No implementado | Todo el billing es manual vía email |
| **Sistema de fiado / crédito (creditCustomers)** | No implementado | Límites están definidos en planes pero no hay UI ni lógica |
| **Notificaciones push / email** | No implementado | Solo alertas in-app |
| **Multi-idioma** | No implementado | Solo español (es-CL) |
| **OAuth (Google, GitHub)** | No implementado | Solo email/contraseña |
| **Recuperación de contraseña** | No implementado | No hay flujo de reset password |
| **Middleware de protección** | No implementado | Protección desde Server Components |
| **Modo oscuro automático** | No implementado | `enableSystem={false}`, solo manual |
| **Plantillas de productos por rubro** | No implementado | Los productos se crean desde cero |
| **Importación masiva de productos** | No implementado | Solo creación individual |
| **Copia de seguridad / exportación completa** | No implementado | Solo exportaciones por módulo |
| **API pública / Webhooks** | No implementado | Sin REST API externa |

### 22.2 Observaciones técnicas

| Aspecto | Observación |
|---------|------------|
| **Plan deprecado en profiles** | `profiles.plan` tiene valores `free`/`pro`/`business` pero está deprecado (usar `businesses.subscription_plan`). Podría eliminarse. |
| **Legacy `business` plan** | Mapeado a `super` en `normalizePlan()`. Migración 18 añadió super/enterprise. |
| **Sin tests** | No se encontraron tests unitarios, de integración ni e2e |
| **Error handling genérico** | `createAuditLog` no lanza errores (solo console.error) |
| **Sin rate limiting** | No hay protección contra abuso de Server Actions |
| **Duplicación client/server** | `admin.ts` y `server.ts` tienen `createServiceClient`/`createAdminClient` que son equivalentes |
| **CSV sin streaming** | Los CSV grandes se generan en memoria como string, podría ser problema con muchos datos |
| **Límites de Enterprise** | Son técnicos (50.000 productos, 100 miembros) pero se muestran como "ilimitados" |
| **Sin caché de métricas** | `getDashboardMetrics` ejecuta 15 consultas cada vez que se carga el dashboard |

### 22.3 Posibles mejoras priorizadas

1. **Sistema de facturación/DTE** — Es la funcionalidad más solicitada para negocios chilenos
2. **Pagos en línea** — Stripe u otro para hacer el billing automático
3. **Importación masiva** — CSV/Excel de productos
4. **Middleware de protección** — Centralizar la lógica de auth
5. **Recuperación de contraseña** — Flujo básico de seguridad
6. **Tests** — Unitarios y de integración para Server Actions
7. **Caché de dashboard** — Redis o similar para evitar 15 queries por carga
8. **API pública** — Para integraciones externas
9. **Notificaciones** — Email o push para alertas críticas
10. **Modo oscuro automático** — Seguir preferencia del sistema

---

*Fin del documento. Generado automáticamente mediante análisis del código fuente.*
