# arquitectura30.md — Sistema de roles: Admin, Dueño, Empleado

## Roles del sistema

| Rol | Quién es | Nivel |
|---|---|---|
| **Admin** | Tú (dueño de la plataforma) | `profiles.role = 'admin'` |
| **Dueño (owner)** | Cliente que paga | `business_users.role = 'owner'` |
| **Empleado (employee)** | Agregado por el dueño | `business_users.role = 'employee'` |

---

## Estado actual vs. lo que hay que hacer

### Admin — ✅ Ya funciona
- `profiles.role = 'admin'` existe.
- `requireAdmin()` protege `/admin`.
- Panel admin ya existe en `app/(app)/admin/`.
- Menú admin ya se agrega en `layout.tsx` si el usuario es admin.
- **No hay que tocar nada.**

### Dueño — ✅ Casi listo
- `businesses.owner_id` lo identifica. `business_users.role = 'owner'` se crea al registrar el negocio.
- Tiene acceso completo a todo en su negocio.
- **Falta**: ocultar pricing dentro de la app, ocultar opciones de plan, que no pueda cambiar `subscription_plan`.

### Empleado — ❌ Hay que crearlo desde cero
- **Hoy no existe diferencia.** Las RLS tratan a todos los miembros igual (`is_business_member()` = CRUD completo en todo).
- **Hay que crear**: migración RLS, server action helper de permisos, UI para invitar, restricciones de UI.

---

## Arquitectura de seguridad (3 capas)

1. **UI (frontend)** — ocultar botones/páginas/menú no permitidos.
2. **Server Actions** — validar `requireBusinessRole()` antes de ejecutar lógica sensible.
3. **RLS (Supabase)** — impedir acceso aunque alguien llame las tablas directamente.

---

## FASE 1 — Migración SQL: renombrar rol y agregar helper

### Archivo
```
supabase/migrations/20260510120000_add_future_proof_employee_roles.sql
```
⚠ **Ya está creado.** Esta migración incluye los roles `employee_limited` y `employee_viewer` para evitar migraciones futuras. El constraint permite todos los valores desde hoy.

### Contenido de la migración

```sql
-- Migrar 'staff' → 'employee' (rol legacy)
update public.business_users
set role = 'employee'
where role = 'staff';

-- Reemplazar el constraint con todos los roles presentes y futuros
alter table public.business_users
  drop constraint if exists business_users_role_check;

alter table public.business_users
  add constraint business_users_role_check
  check (role in (
    'owner',                     -- Dueño del negocio (cliente que paga)
    'admin',                     -- Co-admin / superadmin (solo plataforma)
    'employee',                  -- Empleado base (vender + ver stock)
    'employee_limited',          -- Empleado con aún menos permisos (futuro)
    'employee_viewer'            -- Empleado solo lectura (futuro)
  ));
```

### 1.2 Crear helper SQL `get_business_role()`

```sql
create or replace function public.get_business_role(p_business_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select bu.role
      from public.business_users bu
      where bu.business_id = p_business_id
        and bu.user_id = auth.uid()
    ),
    (
      select case
        when b.owner_id = auth.uid() then 'owner'::text
        else null
      end
      from public.businesses b
      where b.id = p_business_id
    )
  );
$$;

grant execute on function public.get_business_role(uuid) to authenticated;
```

### 1.3 RLS: restringir `products` para employee

SELECT se mantiene para todos los miembros. INSERT/UPDATE/DELETE solo para admin/owner.

```sql
-- Products: mantener SELECT policy existente (is_business_member)
-- Reemplazar INSERT / UPDATE / DELETE policies
drop policy if exists "Members can insert products" on public.products;
create policy "Admin can insert products" on public.products
  for insert to authenticated
  with check (is_business_admin(business_id));

drop policy if exists "Members can update products" on public.products;
create policy "Admin can update products" on public.products
  for update to authenticated
  using (is_business_admin(business_id));

drop policy if exists "Members can delete products" on public.products;
create policy "Admin can delete products" on public.products
  for delete to authenticated
  using (is_business_admin(business_id));
```

### 1.4 RLS: restringir `categories` para employee

Mismo patrón que products: employee solo SELECT.

### 1.5 RLS: restringir `suppliers` para employee

Mismo patrón: employee solo SELECT.

### 1.6 RLS: `stock_movements` — employee solo SELECT

Employee NO debe poder insertar movimientos manuales. La única forma de que se cree un movimiento es a través de la venta (que usa `create_sale_with_items` con `security definer`, bypass RLS).

```sql
-- Stock movements: employee solo SELECT
-- Mantener SELECT policy existente
-- Reemplazar INSERT:
drop policy if exists "Members can insert stock movements" on public.stock_movements;
create policy "Admin can insert stock movements" on public.stock_movements
  for insert to authenticated
  with check (is_business_admin(business_id));

-- DELETE: solo admin
drop policy if exists "Members can delete stock movements" on public.stock_movements;
create policy "Admin can delete stock movements" on public.stock_movements
  for delete to authenticated
  using (is_business_admin(business_id));
```

### 1.7 RLS: `sales` — employee puede INSERT y SELECT, NO UPDATE/DELETE

```sql
-- Sales: mantener SELECT e INSERT para todos (employee necesita crear ventas)
-- UPDATE/DELETE solo admin
drop policy if exists "Members can update sales" on public.sales;
create policy "Admin can update sales" on public.sales
  for update to authenticated
  using (is_business_admin(business_id));

drop policy if exists "Members can delete sales" on public.sales;
create policy "Admin can delete sales" on public.sales
  for delete to authenticated
  using (is_business_admin(business_id));
```

### 1.8 RLS: `audit_logs` — employee no puede SELECT

```sql
-- Audit logs: employee no SELECT, todos pueden INSERT (para registrar eventos)
drop policy if exists "Members can view audit logs" on public.audit_logs;
create policy "Admin can view audit logs" on public.audit_logs
  for select to authenticated
  using (is_business_admin(business_id));
```

---

## FASE 2 — Helper de permisos server-side

### Archivo nuevo
```
lib/auth/require-business-role.ts
```

```ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";
import { requireActiveBusiness } from "@/lib/business/get-active-business";

export type BusinessRole = "owner" | "admin" | "employee";

export async function getBusinessRole(userId: string, businessId: string): Promise<BusinessRole | null> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_business_role", {
    p_business_id: businessId,
  });
  return (data as BusinessRole) ?? null;
}

export async function requireBusinessRole(allowedRoles: BusinessRole[]) {
  const user = await requireUser();
  const business = await requireActiveBusiness(user.id);

  const role = await getBusinessRole(user.id, business.id);

  if (!role || !allowedRoles.includes(role)) {
    throw new Error("No autorizado");
  }

  return { user, business, role };
}
```

---

## FASE 3 — Proteger Server Actions

### `modules/core/products/actions.ts`

```ts
// createProductAction → solo owner
const { role } = await requireBusinessRole(["owner"]);

// updateProductAction → solo owner
const { role } = await requireBusinessRole(["owner"]);

// deleteProductAction → solo owner
const { role } = await requireBusinessRole(["owner"]);

// quickUpdateProductAction → solo owner
const { role } = await requireBusinessRole(["owner"]);
```

### `modules/core/sales/actions.ts`

```ts
// createSaleAction → owner + employee
const { role } = await requireBusinessRole(["owner", "employee"]);
// Nota: create_sale_with_items usa security definer, bypass RLS.
// El employee puede crear ventas sin necesidad de INSERT directo en stock_movements.
```

### `modules/core/inventory/actions.ts`

```ts
// createStockMovementAction → solo owner
const { role } = await requireBusinessRole(["owner"]);

// agregarStockRapidoAction → solo owner
const { role } = await requireBusinessRole(["owner"]);
```

### `modules/core/team/actions.ts` (nuevo)

```ts
// inviteMemberAction → solo owner
// removeMemberAction → solo owner
```

---

## FASE 4 — Gestión de empleados (MVP)

### Ruta nueva
```
app/(app)/equipo/page.tsx
```

### Server actions nuevas
```
modules/core/team/actions.ts
```

Contenido:

```ts
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireBusinessRole } from "@/lib/auth/require-business-role";

export async function listTeamMembers() {
  const { business } = await requireBusinessRole(["owner"]);
  const supabase = await createClient();

  const { data } = await supabase
    .from("business_users")
    .select("id,user_id,role,created_at,profiles(full_name,email)")
    .eq("business_id", business.id)
    .order("created_at");

  return data ?? [];
}

export async function inviteMemberAction(formData: FormData) {
  const { business } = await requireBusinessRole(["owner"]);
  const email = formData.get("email") as string;
  if (!email) return { message: "Email requerido." };

  const supabase = await createClient();

  // Buscar si el usuario existe por email
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (!profile) return { message: "El usuario no está registrado en MultiStock." };

  // Verificar que no sea ya miembro
  const { data: existing } = await supabase
    .from("business_users")
    .select("id")
    .eq("business_id", business.id)
    .eq("user_id", profile.id)
    .maybeSingle();

  if (existing) return { message: "El usuario ya es miembro de este negocio." };

  const { error } = await supabase
    .from("business_users")
    .insert({ business_id: business.id, user_id: profile.id, role: "employee" });

  if (error) return { message: "Error al agregar miembro." };

  revalidatePath("/equipo");
  return { success: true, message: "Empleado agregado correctamente." };
}

export async function removeMemberAction(userId: string) {
  const { business } = await requireBusinessRole(["owner"]);

  const supabase = await createClient();
  const { error } = await supabase
    .from("business_users")
    .delete()
    .eq("business_id", business.id)
    .eq("user_id", userId);

  if (error) return { message: "Error al eliminar miembro." };

  revalidatePath("/equipo");
  return { success: true, message: "Miembro eliminado." };
}
```

### Componente nuevo
```
components/team/team-page.tsx
components/team/invite-member-form.tsx
components/team/team-member-row.tsx
```

### Agregar a navegación

En `config/navigation.ts`, agregar:
```ts
{ label: "Equipo", href: "/equipo", module: "suppliers" },
```
(reutilizando module "suppliers" que es solo para owner, o agregando un module nuevo)

---

## FASE 5 — Restricciones UI para empleado

### Sidebar / navegación

En `app/(app)/layout.tsx`, filtrar los items según el rol del usuario:

```ts
const userRole = await getBusinessRole(user.id, business.id);

const employeeModules = ["dashboard", "products", "inventory", "sales"];
const navigation: NavigationItem[] = userIsAdmin
  ? [...baseNavigation, { label: "Admin Panel", href: "/admin", module: "admin" }]
  : userRole === "employee"
    ? baseNavigation.filter((item) => employeeModules.includes(item.module))
    : baseNavigation;
```

### Página de productos

En `ProductsTable`, ocultar botones "Nuevo", "Editar", "Eliminar" si el rol es employee. Pasar el rol como prop desde la página.

### Página de inventario

Ocultar botón "Registrar movimiento" si es employee.

### Página de equipo

No visible para employee (ya filtrado en el sidebar).

---

## FASE 6 — Ocultar pricing al dueño

En `app/(site)/pricing/page.tsx`:
```tsx
import { getCurrentProfile } from "@/lib/auth/is-admin";
// Si el usuario tiene sesión y tiene un negocio, redirigir
const profile = await getCurrentProfile().catch(() => null);
if (profile && profile.role === "user") {
  redirect("/dashboard");
}
```

El admin sí puede ver pricing para verificar cómo se ve.

---

## FASE 7 — Navegación Admin (ya funciona)

En `app/(app)/layout.tsx` ya existe:
```tsx
const navigation: NavigationItem[] = userIsAdmin
  ? [...baseNavigation, { label: "Admin Panel", href: "/admin", module: "admin" }]
  : baseNavigation;
```

**No requiere cambios.**

---

## Tabla de permisos final

| Acción | Admin | Owner | Employee |
|---|---|---|---|
| Ver productos | ✅ | ✅ | ✅ |
| Crear/editar/eliminar productos | ✅ | ✅ | ❌ |
| Ver inventario | ✅ | ✅ | ✅ |
| Ajustar stock manualmente | ✅ | ✅ | ❌ |
| Crear venta | ✅ | ✅ | ✅ |
| Editar/eliminar venta | ✅ | ✅ | ❌ |
| Ver proveedores | ✅ | ✅ | ❌ |
| Gestionar proveedores | ✅ | ✅ | ❌ |
| Ver reportes | ✅ | ✅ | ❌ |
| Ver auditoría | ✅ | ✅ | ❌ |
| Ver exportaciones | ✅ | ✅ | ❌ |
| Gestionar equipo | ✅ | ✅ | ❌ |
| Cambiar planes | ✅ | ❌ | ❌ |
| Admin panel | ✅ | ❌ | ❌ |

## Notas técnicas importantes

1. **`create_sale_with_items` ya usa `security definer`** — esto significa que el empleado puede crear ventas aunque las RLS de `stock_movements` le impidan INSERT directo. La función corre con permisos de owner y bypass RLS.

2. **`get_business_role()` RPC** — se llama desde el servidor via `supabase.rpc()`. No necesita `"use server"` porque el helper `requireBusinessRole` ya lo es.

3. **El rol `'employee'` reemplaza a `'staff'`** — la migración `20260510120000_add_future_proof_employee_roles.sql` renombra el constraint, migra datos existentes y además incluye `employee_limited` y `employee_viewer` para evitar migraciones futuras.

4. **Seguridad en 3 capas** — si la UI falla (botón visible para employee), la Server Action lo rechaza con `requireBusinessRole()`. Si la Server Action falla (alguien llama la API directamente), la RLS lo rechaza.
