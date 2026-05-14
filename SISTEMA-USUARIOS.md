# Sistema de Usuarios, Roles y Permisos — MultiStock

## Tablas de usuarios

### 1. `profiles` — Una fila por cada persona registrada

| Columna | Valores | Descripción |
|---|---|---|
| `id` | UUID | Misma que `auth.users` |
| `email` | texto | Email de registro |
| `full_name` | texto | Nombre |
| `role` | `'user'` o `'admin'` | Rol global en la plataforma |
| `plan` | `'free'`, `'pro'`, `'business'` | Plan de suscripción |
| `created_at` | timestamp | Cuándo se registró |

### 2. `businesses` — Una fila por cada negocio creado

| Columna | Valores | Descripción |
|---|---|---|
| `id` | UUID | |
| `name` | texto | Nombre del negocio |
| `business_type` | `'almacen'`, `'verduleria'`, `'ferreteria'` | |
| `owner_id` | UUID → `profiles.id` | Dueño del negocio |
| `subscription_plan` | `'free'`, `'pro'`, `'business'` | Plan del negocio |
| `created_at` | timestamp | |

### 3. `business_users` — Usuarios con acceso a un negocio

| Columna | Valores | Descripción |
|---|---|---|
| `id` | UUID | |
| `business_id` | UUID → `businesses.id` | |
| `user_id` | UUID → `profiles.id` | |
| `role` | `'owner'`, `'admin'`, `'employee'`, `'employee_limited'`, `'employee_viewer'` | Rol dentro del negocio |

---

## Los 2 sistemas de roles (NO mezclar)

### Sistema A — Rol global (`profiles.role`)

| Valor | Quién | Acceso |
|---|---|---|
| `'admin'` | Tú (dueño de la plataforma) | Panel admin, cambiar planes, ver todos los usuarios |
| `'user'` | Todos los demás | No ve admin, puede tener negocios |

### Sistema B — Rol por negocio (`business_users.role`)

| Valor | Quién | Acceso |
|---|---|---|
| `'owner'` | El dueño del negocio | TODO: crear/editar/eliminar productos, ajustar stock, ver reportes, gestionar equipo |
| `'employee'` | Invitado por el owner | Solo: ver productos/inventario/ventas, crear ventas |
| `'admin'` | (reservado) | Mismos permisos que owner (se usa en RLS `is_business_admin`) |

> Un usuario puede ser `profiles.role = 'user'` y a la vez `business_users.role = 'owner'` de su negocio.

---

## Seguridad en 3 capas

### Capa 1 — UI (Frontend)

| ¿Dónde? | ¿Qué hace? |
|---|---|
| `layout.tsx` | Sidebar filtrado: employee solo ve Dashboard, Productos, Inventario, Ventas |
| `products-table.tsx` | Botones Editar/Eliminar ocultos para employee |
| `page.tsx` (productos) | Botón "Nuevo producto" oculto para employee |

### Capa 2 — Server Actions

| Función | Roles permitidos |
|---|---|
| `createProductAction` | solo owner |
| `updateProductAction` | solo owner |
| `deleteProductAction` | solo owner |
| `quickUpdateProductAction` | solo owner |
| `toggleProductActiveAction` | solo owner |
| `deactivateProductAction` | solo owner |
| `createSaleAction` | owner + employee |
| `createStockMovementAction` | solo owner |
| `createBusinessAction` | cualquiera autenticado |
| `inviteMemberAction` | solo owner |
| `removeMemberAction` | solo owner |
| Admin actions (`getUsers`, etc.) | solo admin global |

### Capa 3 — RLS (Base de datos)

| Tabla | Employee puede |
|---|---|
| `products` | ✅ SELECT, ❌ INSERT/UPDATE/DELETE |
| `categories` | ✅ SELECT, ❌ INSERT/UPDATE/DELETE |
| `suppliers` | ✅ SELECT, ❌ INSERT/UPDATE/DELETE |
| `stock_movements` | ✅ SELECT, ❌ INSERT/UPDATE/DELETE |
| `sales` | ✅ SELECT e INSERT, ❌ UPDATE/DELETE |
| `sale_items` | ✅ SELECT e INSERT, ❌ UPDATE/DELETE |
| `audit_logs` | ❌ ni SELECT |
| `stock_alerts` | ✅ TODO |
| `businesses` | ✅ SELECT si es miembro |
| `business_users` | ✅ SELECT si es miembro |

### Capa 4 — Páginas protegidas

| Ruta | Protegida para |
|---|---|
| `/equipo` | solo owner |
| `/proveedores` + subrutas | solo owner |
| `/auditoria` | solo owner |
| `/exportaciones` | solo owner |
| `/reportes` | solo owner |
| `/productos/nuevo` | solo owner |
| `/productos/[id]/editar` | solo owner |
| `/inventario/movimientos/nuevo` | solo owner |

---

## Admin panel (solo tú)

- Ruta: `/admin` (solo visible si `profiles.role = 'admin'`)
- Puedes **cambiar plan** de cualquier usuario (`free` ↔ `pro` ↔ `business`)
- Puedes **promover/quitar admin** a otros usuarios
- Puedes ver todos los usuarios y negocios registrados
- Para hacer admin a alguien: ejecutas el script `supabase/scripts/promote-to-admin.sql`

---

## Planes de suscripción

| Plan | Precio | Productos | Ventas/mes | Módulos |
|---|---|---|---|---|
| **Free** | $0 | 30 máx | 50 máx | Dashboard, productos, inventario, ventas, alertas |
| **Pro** | $17.990 | Ilimitados | Ilimitadas | Todo + proveedores, auditoría, reportes, exportaciones, QR |
| **Business** | $29.990 | Ilimitados | Ilimitadas | Todo lo de Pro + soporte prioritario |

---

## Helpers de autorización

| Helper | Archivo | Uso | Qué hace |
|---|---|---|---|
| `requireUser()` | `lib/auth/session.ts` | Cualquier action/page | Redirige a login si no hay sesión |
| `getCurrentProfile()` | `lib/auth/is-admin.ts` | Server components | Trae `profiles.role` y `profiles.plan` |
| `requireAdmin()` | `lib/auth/is-admin.ts` | Admin actions | Redirige a `/` si no es admin global |
| `getBusinessRole()` | `lib/auth/require-business-role.ts` | Server | Consulta `get_business_role()` RPC |
| `requireBusinessRole()` | `lib/auth/require-business-role.ts` | Server actions | Lanza error si no tiene el rol |
| `requirePageAccess()` | `lib/auth/require-page-access.ts` | Páginas | Redirige a `/dashboard` si no tiene el rol |
| `requireActiveBusiness()` | `lib/business/get-active-business.ts` | Cualquier action/page | Redirige a `/onboarding` si no tiene negocio |
