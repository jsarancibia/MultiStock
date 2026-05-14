# arquitectura32.md — Refactorización controlada de usuarios, roles y permisos

## Precaución

Este documento describe cambios en seguridad y permisos.

Cada fase incluye:
- qué archivos tocar
- qué NO tocar
- orden exacto de implementación
- validación post-cambio

NO implementar sin leer las advertencias de cada fase.

---

## ✅ Resultado de la verificación contra código real

Se revisaron todos los archivos mencionados contra el código actual (10 mayo 2026). Resultados:

### Hallazgos corregidos en el documento

| # | Hallazgo | Severidad | Corrección aplicada |
|---|---|---|---|
| 1 | FASE 4: Código ejemplo de `resolveStockAlertAction` usaba `userId: business.id` incorrecto | 🔴 Error | Cambiado a `userId: user.id` con `const { user, business }` |
| 2 | FASE 3: `admin-users-table.tsx` requiere cambios en `getUsers()` también, no solo en UI | 🟡 Medio | Se agregó sub-paso 3.4 con migración de `getUsers()` |
| 3 | FASE 3: `recentUsers` en admin dashboard muestra `{user.plan}` en línea 44 | 🟢 Bajo | Se documentó como "display legacy", mantener por ahora |
| 4 | FASE 5: `app/(app)/inventario/page.tsx` no tiene verificación `isEmployee` | 🟢 Bajo | Ya documentado como opcional |

### Lo que ya está bien

| Afirmación | Verificación |
|---|---|
| F2: `BusinessRole` en `require-business-role.ts` es `"owner" \| "admin" \| "employee"` | ✅ Correcto, línea 7 |
| F2: `BusinessRole` en `types/database.ts` es `"owner" \| "admin" \| "staff"` (desactualizado) | ✅ Correcto, línea 8 |
| F2: `requirePageAccess` importa `BusinessRole` desde el helper | ✅ Correcto, línea 4 |
| F3: `getCurrentProfile()` selecciona `plan` desde profiles | ✅ Correcto, línea 20 de is-admin.ts |
| F3: `updateUserPlan()` actualiza BOTH `profiles.plan` Y `businesses.subscription_plan` | ✅ Correcto, líneas 97-113 de admin/actions.ts |
| F3: `getAdminDashboard()` cuenta desde `profiles.plan` | ✅ Correcto, línea 73 |
| F3: admin page usa `dashboard.usersByPlan` | ✅ Correcto, líneas 24-25 |
| F4: RLS stock_alerts es `for all` con `is_business_member` | ✅ Correcto, policy en migración inicial |
| F4: `resolveStockAlertAction` NO tiene protección de rol | ✅ Correcto, no usa `requireBusinessRole` |
| F4: Employee NO puede crear alertas manualmente | ✅ Correcto, no hay action para eso |
| F5: `productos/page.tsx` usa `isEmployee` | ✅ Correcto, línea 35 |
| F5: `products-table.tsx` oculta editar/eliminar si isEmployee | ✅ Correcto, líneas 158-181 |
| F6: equipo, proveedores, auditoría, etc. protegidas con `["owner"]` | ✅ Correcto, todas verificadas |
| `profiles.plan` solo se usa en admin (6 referencias) | ✅ Correcto, verificado |

### Matriz de riesgos real (post-verificación)

| Fase | Riesgo | Detalle |
|---|---|---|
| F2 — Roles | 🟢 Bajo | `"admin"` y `"staff"` existen como tipos TS pero `"admin"` nunca se asigna en BD |
| F4 — stock_alerts | 🟢 Bajo | Migración acotada a una tabla |
| F3 — subscription_plan | 🟡 Medio | Toca 4+ archivos y requiere coordinar cambios en admin actions + UI |
| F5 — UI verify | 🟢 Bajo | Solo auditoría |
| F6 — Rutas | 🟢 Bajo | Ya implementado |
| F7 — Admin ready | 🟢 Bajo | No implementar nada nuevo |
| F8 — Limpieza | 🟢 Bajo | Solo documentación |

---

## FASE 1 — Auditoría completa del sistema actual

Antes de cambiar cualquier cosa, entender qué existe hoy.

### Tablas

#### `profiles`

```
id          uuid PK → auth.users
full_name   text
email       text
role        text CHECK ('admin', 'user')        ← Rol global (tú vs usuarios)
plan        text CHECK ('free', 'pro', 'business')  ← ⚠ DUPLICADO con businesses
created_at  timestamptz
updated_at  timestamptz
```

#### `businesses`

```
id                  uuid PK
owner_id            uuid → profiles.id
name                text
business_type       text CHECK ('verduleria', 'almacen', 'ferreteria')
subscription_plan   text NOT NULL DEFAULT 'free'  ← ✅ fuente de verdad real
created_at          timestamptz
updated_at          timestamptz
```

#### `business_users`

```
id              uuid PK
business_id     uuid → businesses.id
user_id         uuid → profiles.id
role            text CHECK ('owner', 'admin', 'employee', 'employee_limited', 'employee_viewer')
created_at      timestamptz
```

### Dependencias actuales de `profiles.plan`

| Archivo | Uso | Riesgo si se elimina |
|---|---|---|
| `lib/auth/is-admin.ts` | `getCurrentProfile()` selecciona `plan` | Solo lectura, no crítico |
| `app/(site)/pricing/page.tsx` | Redirige si `profile.role !== "admin"` | Usa `role`, no `plan` |
| `modules/admin/actions.ts` | `getAdminDashboard()` cuenta usuarios por plan | Solo estadística admin |
| `modules/admin/actions.ts` | `updateUserPlan()` actualiza `profiles.plan` + `businesses.subscription_plan` | ⚠ Ambos |
| `components/admin/admin-users-table.tsx` | Muestra plan por usuario | UI admin |
| `components/admin/user-plan-select.tsx` | Selector de plan | UI admin |

**Conclusión:** `profiles.plan` solo se usa en el panel admin. El negocio real usa `businesses.subscription_plan`. La migración es segura y acotada.

### Dependencias de `BusinessRole`

| Archivo | Valor actual |
|---|---|
| `lib/auth/require-business-role.ts` | `"owner" \| "admin" \| "employee"` |
| `types/database.ts` | `"owner" \| "admin" \| "staff"` (desactualizado) |
| `lib/auth/require-page-access.ts` | usa `BusinessRole` del helper |

### RLS — stock_alerts (BUG detectado)

La migración anterior **NO modificó** `stock_alerts`. Policy actual:

```sql
create policy "Members manage stock_alerts"
  on public.stock_alerts for all
  to authenticated
  using (public.is_business_member(business_id))
  with check (public.is_business_member(business_id));
```

**Esto significa que employee puede crear y borrar alertas.** BUG real.

### Estado actual de `is_business_admin()` SQL

```sql
and bu.role in ('owner', 'admin')
```

El `'admin'` es redundante — `is_business_admin()` ya reconoce al owner por `businesses.owner_id`. No rompe nada dejarlo así.

### Server Actions protegidas

| Action | Roles | Cambio necesario |
|---|---|---|
| `createProductAction` | owner | ✅ ok |
| `updateProductAction` | owner | ✅ ok |
| `deleteProductAction` | owner | ✅ ok |
| `quickUpdateProductAction` | owner | ✅ ok |
| `toggleProductActiveAction` | owner | ✅ ok |
| `deactivateProductAction` | owner | ✅ ok |
| `createSaleAction` | owner, employee | ✅ ok |
| `createStockMovementAction` | owner | ✅ ok |
| `inviteMemberAction` | owner | ✅ ok |
| `removeMemberAction` | owner | ✅ ok |
| `listStockAlerts` | sin protección | solo SELECT, seguro |
| `resolveStockAlertAction` | sin protección | requiere owner + employee |

---

## ▶ ORDEN DE IMPLEMENTACIÓN

```
1. FASE 2 → Simplificar roles (alta prioridad)
2. FASE 4 → Arreglar stock_alerts (bug real)
3. FASE 3 → Centralizar subscription_plan (preparar cobro)
4. FASE 5 → Validar UI employee (auditoría)
5. FASE 6 → Validar rutas (auditoría)
6. FASE 7 → Admin ready (dejar preparado)
7. FASE 8 → Limpieza final
```

---

## FASE 2 — Simplificar roles de negocio

**Prioridad: 🔴 Alta — HACER PRIMERO**

Hoy hay deuda técnica: `owner`, `admin`, `employee`, `employee_limited`, `employee_viewer`, `staff`.

MultiStock es para negocio chico/mediano. No necesita RBAC complejo.

**Resultado final:**

| Rol | Qué puede hacer |
|---|---|
| `owner` | Controla todo |
| `employee` | Vende y consulta |

### Migración SQL

Crear `supabase/migrations/20260510140000_simplify_business_roles.sql`:

```sql
-- MultiStock: simplificar roles de negocio a solo owner + employee

do $$
begin
  if exists (select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'business_users')
  then
    -- admin → owner
    update public.business_users
    set role = 'owner'
    where role = 'admin';

    -- employee_limited → employee
    update public.business_users
    set role = 'employee'
    where role = 'employee_limited';

    -- employee_viewer → employee
    update public.business_users
    set role = 'employee'
    where role = 'employee_viewer';

    -- Reemplazar constraint a solo dos roles
    alter table public.business_users
      drop constraint if exists business_users_role_check;

    alter table public.business_users
      add constraint business_users_role_check
      check (role in ('owner', 'employee'));
  end if;
end $$;
```

⚠ **ADVERTENCIA:** Verificar que no hay registros con `role = 'admin'` que no sean owners. En la práctica nunca se asigna, pero revisar.

### TypeScript — `BusinessRole`

```ts
// lib/auth/require-business-role.ts
export type BusinessRole = "owner" | "employee";
```

```ts
// types/database.ts
export type BusinessRole = "owner" | "employee";
```

### Server Actions

- `createSaleAction` usa `["owner", "employee"]` — no requiere cambios
- Todas las demás usan `["owner"]` — no requieren cambios

### RPC `get_business_role()` en BD

No requiere cambios. Retorna el texto del rol sin filtrar.

### SQL `is_business_admin()`

**NO MODIFICAR.** La línea `and bu.role in ('owner', 'admin')` es redundante pero inofensiva. El owner siempre es reconocido por `businesses.owner_id`.

### Riesgos

- 🟡 **Medio** — Si algún código usa el string `"admin"` como `BusinessRole`, fallará en compilación. Exactamente lo que queremos: que el compilador nos obligue a actualizar.
- 🟢 Bajo: `'employee_limited'` y `'employee_viewer'` nunca se asignaron en producción.
- Ningún cambio en RLS.

---

## FASE 4 — Arreglar permisos employee en stock_alerts

**Prioridad: 🔴 Alta — HACER SEGUNDO (antes que planes)**

BUG REAL: employee puede INSERT y DELETE alertas hoy. Las alertas las genera el sistema automáticamente.

**Permisos finales para employee en stock_alerts:**

| Operación | Employee |
|---|---|
| SELECT | ✅ Ver alertas |
| UPDATE resolved | ✅ Marcar como resuelta |
| INSERT | ❌ NO |
| DELETE | ❌ NO |

### Migración SQL

Crear `supabase/migrations/20260510150000_restrict_employee_stock_alerts.sql`:

```sql
-- stock_alerts: permisos employee limitados
do $$
begin
  if exists (select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'stock_alerts')
  then
    drop policy if exists "Members manage stock_alerts" on public.stock_alerts;

    create policy "Members can view stock_alerts"
      on public.stock_alerts for select
      to authenticated
      using (public.is_business_member(business_id));

    create policy "Members can resolve stock_alerts"
      on public.stock_alerts for update
      to authenticated
      using (public.is_business_member(business_id))
      with check (public.is_business_member(business_id));

    create policy "Admin can insert stock_alerts"
      on public.stock_alerts for insert
      to authenticated
      with check (public.is_business_admin(business_id));

    create policy "Admin can delete stock_alerts"
      on public.stock_alerts for delete
      to authenticated
      using (public.is_business_admin(business_id));
  end if;
end $$;
```

### Server action resolveStockAlertAction

Archivo: `modules/core/alerts/actions.ts`

Agregar protección `requireBusinessRole(["owner", "employee"])`:

```ts
"use server";

import { revalidatePath } from "next/cache";
import { createAuditLog } from "@/lib/audit/create-audit-log";
import { createClient } from "@/lib/supabase/server";
import { requireBusinessRole } from "@/lib/auth/require-business-role";

export async function resolveStockAlertAction(formData: FormData) {
  const { user, business } = await requireBusinessRole(["owner", "employee"]);
  const alertId = String(formData.get("alertId") ?? "").trim();
  if (!alertId) return;

  const supabase = await createClient();
  const { data: alert } = await supabase
    .from("stock_alerts")
    .select("id,type,message,products(name)")
    .eq("id", alertId)
    .eq("business_id", business.id)
    .maybeSingle();

  if (!alert) return;

  const { error } = await supabase
    .from("stock_alerts")
    .update({ resolved: true })
    .eq("id", alertId)
    .eq("business_id", business.id);

  if (error) {
    console.error("resolveStockAlertAction", error.message);
    return;
  }

  const pname = alert.products as { name: string } | null;

  await createAuditLog({
    businessId: business.id,
    userId: user.id,
    entityType: "stock_alert",
    entityId: alertId,
    action: "alert_resolved",
    summary: `Alerta ${alert.type} resuelta · ${pname?.name ?? "producto"}`,
    afterData: { resolved: true },
  });

  revalidatePath("/alertas");
}
```

⚠ NOTA: `requireBusinessRole` retorna `{ user, business, role }`. En el código de ejemplo se usó `const { business }` pero se necesita `user` para `createAuditLog`. Usar `const { user, business } = await requireBusinessRole(["owner", "employee"]);` en su lugar.

### Riesgos

- 🟢 **Bajo** — Migración pequeña y acotada. Solo afecta policies de `stock_alerts`.
- `listStockAlerts()` es solo SELECT — no necesita protección adicional.

---

## FASE 3 — Centralizar `subscription_plan` solo en `businesses`

**Prioridad: 🟡 Media — HACER TERCERO**

Hoy existe doble fuente de verdad: `profiles.plan` y `businesses.subscription_plan`.

**¿Qué pasa si entran en conflicto?**
- Usuario: Free
- Negocio: Business
- ¿A quién hace caso el sistema? → **Bug seguro.**

La fuente de verdad debe ser `businesses.subscription_plan` porque:
- el plan pertenece al negocio, no a la persona
- permite futuro: José puede tener negocio 1 → Pro, negocio 2 → Free

### ⚠ Regla de oro: NO borrar `profiles.plan` todavía

Hacer en **2 pasos**:

1. **Paso 1 (ahora):** Migrar TODAS las lecturas. El sistema ya usa `businesses.subscription_plan`. Dejar `profiles.plan` quieto.
2. **Paso 2 (futuro):** Cuando todo funcione, hacer `DROP COLUMN plan`.

### Paso 3.1 — Migrar `updateUserPlan` en admin

Archivo: `modules/admin/actions.ts`

```ts
// Antes: actualiza ambos
const { error } = await supabase
  .from("profiles")
  .update({ plan: parsed.plan })
  .eq("id", parsed.userId);

// Después: actualizar todos los negocios del usuario
const { error } = await supabase
  .from("businesses")
  .update({ subscription_plan: parsed.plan })
  .eq("owner_id", parsed.userId);
```

Eliminar el bloque que actualiza `profiles.plan`.

### Paso 3.2 — Migrar `getAdminDashboard()`

```ts
// Antes:
const { data: planRows } = await supabase.from("profiles").select("plan");
const usersByPlan = { free: 0, pro: 0, business: 0 };
// ...

// Después:
const { data: planRows } = await supabase.from("businesses").select("subscription_plan");
const businessesByPlan = { free: 0, pro: 0, business: 0 };
for (const row of planRows ?? []) {
  const plan = adminPlanSchema.safeParse(row.subscription_plan);
  if (plan.success) businessesByPlan[plan.data] += 1;
}
```

Cambiar el nombre de la propiedad retornada: `usersByPlan` → `businessesByPlan`.

### Paso 3.3 — Migrar admin page

Archivo: `app/(app)/admin/page.tsx`

```tsx
{/* Antes */}
<AdminStatCard label="Plan Free" value={dashboard.usersByPlan.free} />
<AdminStatCard label="Plan Pro + Business" value={dashboard.usersByPlan.pro + dashboard.usersByPlan.business} />

{/* Después */}
<AdminStatCard label="Negocios Free" value={dashboard.businessesByPlan.free} />
<AdminStatCard label="Negocios Pro + Business" value={dashboard.businessesByPlan.pro + dashboard.businessesByPlan.business} />
```

### Paso 3.4 — Migrar admin-users-table (UI) y getUsers()

La tabla de usuarios y `getUsers()` actualmente usan `plan`. Como ahora el plan pertenece al negocio:

**`modules/admin/actions.ts` — `getUsers()`:**
```ts
// Antes:
.select("id,email,role,plan,created_at")

// Después:
.select("id,email,role,created_at")  // ← sin plan
```

**`components/admin/admin-users-table.tsx`:**
- Eliminar columna "Plan" (th + td)
- Eliminar columna "Cambiar plan" (UserPlanSelect)
- Ajustar colSpan del mensaje vacío de 6 a 4

**`components/admin/user-plan-select.tsx`:**
- Este componente puede mantenerse (se usará en tabla de negocios después)
- O eliminar si no se usa más adelante

⚠ NOTA: `getAdminDashboard()` usa `recentUsers` que también selecciona `plan`. Para ese caso:
```ts
// Opción A: mantener plan en recentUsers (solo display, no fuente de verdad)
// Opción B: eliminar plan de recentUsers y de la línea 44 de admin/page.tsx
// Recomendado: Opción A por ahora, es solo display legacy
```

### Paso 3.5 — Migrar `getCurrentProfile()`

```ts
// lib/auth/is-admin.ts
export type CurrentProfile = {
  id: string;
  email: string | null;
  role: "admin" | "user";
  created_at: string;
  // plan eliminado — ahora en businesses.subscription_plan
};

export const getCurrentProfile = cache(async (currentUser?: User): Promise<CurrentProfile | null> => {
  const user = currentUser ?? (await requireUser());
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id,email,role,created_at")  // ← sin plan
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data) return null;
  return data;
});
```

### Paso 3.6 — Pricing page

Archivo: `app/(site)/pricing/page.tsx`

Usa `profile.role`, no `profile.plan`. **No requiere cambios.**

### Paso 3.7 — Archivos que NO se tocan

| Archivo | Motivo |
|---|---|
| `config/plans.ts` | Ya usa `SubscriptionPlan` de forma abstracta |
| `lib/billing/plan-guards.ts` | Ya usa `business.subscription_plan` |
| `lib/billing/require-plan-module.ts` | Ya usa `business.subscription_plan` |
| `config/navigation.ts` | Ya usa `subscriptionPlan` |
| Cualquier action que use `assertProductLimit()` | Ya recibe `business` |

### Paso 3.8 — Marcar `profiles.plan` como deprecated

Agregar comentario en `supabase/migrations/20260506120000_add_global_roles_and_profile_plan.sql`:

```sql
-- ⚠ DEPRECATED: Se mantiene por compatibilidad.
-- Usar businesses.subscription_plan como fuente de verdad.
-- Se eliminará en una migración futura.
```

NO borrar la columna ahora.

### Riesgos

- 🟡 **Medio** — Es la fase más delicada porque puedes romper guards premium.
- Mitigación: migrar lecturas primero, dejar `profiles.plan` quieto.
- Mitigación: los guards ya usan `business.subscription_plan`, no `profiles.plan`.

---

## FASE 5 — UI según rol (auditoría)

**Prioridad: 🟢 Baja — Solo verificar**

### Sidebar/Layout — ✅ Ya implementado

```ts
// app/(app)/layout.tsx
const employeeModules = ["dashboard", "products", "inventory", "sales"];
const userBusinessRole = !userIsAdmin ? await getBusinessRole(user.id, business.id) : null;
const finalNavigation = userBusinessRole === "employee"
  ? navigation.filter((item) => employeeModules.includes(item.module))
  : navigation;
```

### Botones ocultos — ✅ Ya implementado

| Elemento | Archivo | Estado |
|---|---|---|
| "Nuevo producto" | `app/(app)/productos/page.tsx` | ✅ oculto si isEmployee |
| "Editar" en tabla | `components/productos/products-table.tsx` | ✅ oculto si isEmployee |
| "Eliminar" en tabla | `components/productos/products-table.tsx` | ✅ oculto si isEmployee |

### Verificar inventario

`app/(app)/inventario/page.tsx` — verificar que "Registrar movimiento" esté oculto para employee. Si no, agregar:

```tsx
const { role } = await requirePageAccess(["owner", "employee"]);
const isEmployee = role === "employee";
```

---

## FASE 6 — Proteger rutas (auditoría)

**Prioridad: 🟢 Baja — Solo verificar**

### Páginas solo owner — ✅ Ya protegido

| Página | requirePageAccess |
|---|---|
| `app/(app)/equipo/page.tsx` | ✅ `["owner"]` |
| `app/(app)/proveedores/page.tsx` | ✅ `["owner"]` |
| `app/(app)/auditoria/page.tsx` | ✅ `["owner"]` |
| `app/(app)/exportaciones/page.tsx` | ✅ `["owner"]` |
| `app/(app)/reportes/page.tsx` | ✅ `["owner"]` |
| `app/(app)/productos/nuevo/page.tsx` | ✅ `["owner"]` |
| `app/(app)/productos/[id]/editar/page.tsx` | ✅ `["owner"]` |
| `app/(app)/inventario/movimientos/nuevo/page.tsx` | ✅ `["owner"]` |

### Páginas que employee SÍ puede ver

| Página | Protección |
|---|---|
| `/dashboard` | Sin protección extra (layout filtra) |
| `/productos` | Sin protección extra (layout filtra) |
| `/inventario` | Sin protección extra (layout filtra) |
| `/ventas` | Sin protección extra (layout filtra) |
| `/alertas` | Sin protección extra (layout filtra) |

### Prueba manual

Employee escribe URL manual:

```
/productos/nuevo    → rebota (redirect /dashboard)
/proveedores        → rebota
/auditoria          → rebota
/exportaciones      → rebota
/reportes           → rebota
```

Si rebota → listo. No tocar más.

---

## FASE 7 — Admin panel ready

**Prioridad: 🟢 Baja — Dejar preparado, NO implementar restricciones aún**

### Estado actual

| Archivo | Estado |
|---|---|
| `app/(app)/admin/page.tsx` | ✅ Dashboard con stats |
| `app/(app)/admin/users/page.tsx` | ✅ CRUD usuarios |
| `app/(app)/admin/businesses/page.tsx` | ✅ CRUD negocios |
| `app/(app)/layout.tsx` | ✅ "Admin Panel" si isAdmin |
| `modules/admin/actions.ts` | ✅ Server actions |
| `lib/auth/is-admin.ts` | ✅ isAdmin, getCurrentProfile |

### NO implementar aún

| Funcionalidad | Cuándo |
|---|---|
| Estado `pending` / `active` en profiles | Cuando haya usuarios reales y se necesite bloquear morosos |
| Aprobación manual de cuentas | Cuando haya riesgo de spam |
| Restricciones comerciales | Cuando los planes estén definidos |

Primero: crear cuenta → usar sistema. Sin fricción.

---

## FASE 8 — Limpieza final

### Archivos a modificar (resumen)

| Archivo | Fase | Cambio |
|---|---|---|
| `supabase/migrations/20260510140000_simplify_business_roles.sql` | F2 | Nueva migración: simplificar roles a owner/employee |
| `supabase/migrations/20260510150000_restrict_employee_stock_alerts.sql` | F4 | Nueva migración: RLS stock_alerts restrictivo |
| `lib/auth/require-business-role.ts` | F2 | `BusinessRole = "owner" \| "employee"` |
| `types/database.ts` | F2 | `BusinessRole = "owner" \| "employee"` |
| `modules/admin/actions.ts` | F3 | `updateUserPlan()` solo actualiza businesses |
| `modules/admin/actions.ts` | F3 | `getAdminDashboard()` cuenta negocios no perfiles |
| `app/(app)/admin/page.tsx` | F3 | `usersByPlan` → `businessesByPlan` |
| `components/admin/admin-users-table.tsx` | F3 | Eliminar columna plan + UserPlanSelect |
| `modules/admin/actions.ts` | F3 | `getUsers()` sin `plan` |
| `lib/auth/is-admin.ts` | F3 | `getCurrentProfile()` sin `plan` |
| `modules/core/alerts/actions.ts` | F4 | `resolveStockAlertAction` con `requireBusinessRole` |
| `app/(app)/inventario/page.tsx` | F5 | Opcional: ocultar botón ajuste para employee |

### Archivos que NO se modifican

| Archivo | Motivo |
|---|---|
| `config/plans.ts` | Ya abstracto, usa SubscriptionPlan |
| `lib/billing/plan-guards.ts` | Ya usa business.subscription_plan |
| `lib/billing/require-plan-module.ts` | Ya usa business.subscription_plan |
| `config/navigation.ts` | Ya usa subscriptionPlan |
| `modules/core/products/actions.ts` | Ya protegido con ["owner"] |
| `modules/core/sales/actions.ts` | Ya protegido con ["owner", "employee"] |
| `modules/core/stock-movements/actions.ts` | Ya protegido con ["owner"] |
| `modules/core/team/actions.ts` | Ya protegido con ["owner"] |
| `app/(app)/layout.tsx` | Ya filtra sidebar por rol |

### Breaking changes detectados

1. **`BusinessRole` cambia** — cualquier código que use `"admin"` o `"staff"` como tipo fallará en compilación. ✅ Es lo que queremos: el compilador nos obliga a actualizar.
2. **`getAdminDashboard()` cambia propiedad** — `usersByPlan` → `businessesByPlan`. Actualizar admin page.
3. **`getCurrentProfile()` ya no retorna `plan`** — Solo la usa `is-admin.ts` y `pricing/page.tsx`. Ninguna usa `plan`.
4. **`updateUserPlan` ya no actualiza `profiles.plan`** — La UI admin mostrará plan por negocio.

### Validación post-implementación

1. `npx tsc --noEmit` — debe compilar sin errores
2. Admin dashboard carga sin errores
3. Employee puede crear venta
4. Employee puede resolver alerta
5. Employee NO puede crear/editar/borrar productos
6. Employee NO puede acceder a /equipo, /proveedores, /auditoria (redirect)
7. Sidebar oculta módulos correctos para employee
8. Sidebar muestra "Admin Panel" para admin global
9. Ejecutar migraciones SQL en Supabase
10. Verificar RLS en stock_alerts

### Resumen de riesgos por fase

| Fase | Riesgo | Mitigación |
|---|---|---|
| F2 — Roles | 🟡 Medio | Compilador detecta tipos incorrectos |
| F4 — stock_alerts | 🟢 Bajo | Migración acotada, solo policies |
| F3 — subscription_plan | 🟡 Medio | Migrar lecturas primero, no borrar columna |
| F5 — UI verify | 🟢 Bajo | Solo auditoría |
| F6 — Rutas | 🟢 Bajo | Solo auditoría |
| F7 — Admin ready | 🟢 Bajo | No implementar nada nuevo |
| F8 — Limpieza | 🟢 Bajo | Documentación y validación |

---

## Notas finales

1. **`profiles.plan` queda como columna huérfana.** No borrar ahora. Marcar como deprecated y eliminar en migración futura cuando todo funcione correctamente.

2. **`is_business_admin()` con `'admin'` en el IN.** No modificar. Es redundante pero inofensivo.

3. **Esto es la base para empezar a cobrar.** Con roles simples (owner/employee), plan centralizado en business, y permisos RLS correctos, el sistema está listo para:
   - Definir límites por plan (productos, ventas, movimientos)
   - Bloquear módulos premium
   - Escalar a más negocios por usuario
