# Arquitectura 16 - Roles admin/user y panel de administración

Este documento define una implementación incremental para agregar roles globales (`admin` / `user`) y un panel de administración en MultiStock, manteniendo la arquitectura actual de Next.js + Supabase.

La solución debe respetar lo que ya existe:

- Autenticación con Supabase en `lib/auth`.
- Cliente Supabase SSR en `lib/supabase/server.ts`.
- App privada bajo `app/(app)`.
- Acciones servidor en módulos como `modules/core/*/actions.ts`.
- Planes comerciales definidos en `config/plans.ts`.
- Plan operativo actual por negocio en `businesses.subscription_plan`.

## 1. Objetivo

Permitir que un usuario con rol global `admin` pueda entrar a `/admin` y gestionar información general del sistema:

- Ver usuarios registrados.
- Ver negocios creados.
- Cambiar plan comercial (`free`, `pro`, `business`).
- Cambiar rol global (`user`, `admin`).
- Ver métricas generales.

Los usuarios normales deben seguir usando la app sin cambios y no deben ver ni acceder al panel admin.

## 2. Decisiones de arquitectura

### Rol global vs rol por negocio

El proyecto ya tiene `business_users.role` con roles por negocio (`owner`, `admin`, `staff`). Ese rol no debe mezclarse con el nuevo rol global.

Roles existentes:

- `business_users.role`: permisos dentro de un negocio.
- `profiles.role`: permisos globales del sistema MultiStock.

Nuevo criterio:

- `profiles.role = 'admin'`: puede administrar el sistema.
- `profiles.role = 'user'`: usuario normal.

### Plan en usuario vs plan en negocio

Actualmente MultiStock ya controla funciones por `businesses.subscription_plan`. Por eso, aunque se agregue `profiles.plan`, no conviene romper los guards existentes.

Recomendación:

- Agregar `profiles.plan` como plan comercial principal de la cuenta.
- Mantener `businesses.subscription_plan` como fuente operativa para los límites actuales.
- Al cambiar el plan desde el panel admin, actualizar `profiles.plan` y también los negocios del usuario dueño para que los guards existentes sigan funcionando.

Esto evita que el panel muestre un plan distinto al que realmente usa la app.

## 3. Estructura de archivos propuesta

```txt
app/
  (app)/
    admin/
      layout.tsx
      page.tsx
      users/
        page.tsx
      businesses/
        page.tsx

components/
  admin/
    admin-stat-card.tsx
    admin-users-table.tsx
    admin-businesses-table.tsx
    user-plan-select.tsx
    user-role-select.tsx

lib/
  auth/
    is-admin.ts
  supabase/
    admin.ts
  validations/
    admin.ts

modules/
  admin/
    actions.ts

supabase/
  migrations/
    20260506120000_add_global_roles_and_profile_plan.sql
```

Notas:

- `app/(app)/admin` permite reutilizar `AppShell`, header y sidebar actuales.
- `modules/admin/actions.ts` mantiene el patrón de server actions por dominio.
- `lib/auth/is-admin.ts` concentra la verificación de permisos.
- `lib/supabase/admin.ts` debe existir solo si se usa `SUPABASE_SERVICE_ROLE_KEY` en servidor.

## 4. Fase 1 - Base de datos y roles

### Migración SQL

Crear una migración nueva, por ejemplo:

`supabase/migrations/20260506120000_add_global_roles_and_profile_plan.sql`

```sql
-- MultiStock: roles globales y plan comercial por perfil.

alter table public.profiles
  add column if not exists role text not null default 'user',
  add column if not exists plan text not null default 'free';

alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('admin', 'user'));

alter table public.profiles
  drop constraint if exists profiles_plan_check;

alter table public.profiles
  add constraint profiles_plan_check
  check (plan in ('free', 'pro', 'business'));

create index if not exists idx_profiles_role on public.profiles (role);
create index if not exists idx_profiles_plan on public.profiles (plan);
create index if not exists idx_profiles_created_at on public.profiles (created_at desc);

update public.profiles
set
  role = coalesce(role, 'user'),
  plan = coalesce(plan, 'free');
```

### Trigger de registro

La función `public.handle_new_user()` ya crea registros en `profiles`. Conviene actualizarla explícitamente para dejar claro que todo usuario nuevo nace como `user/free`.

```sql
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role, plan)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    ),
    'user',
    'free'
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name);

  return new;
end;
$$;
```

No se debe actualizar `role` ni `plan` en el `on conflict`, para evitar que un reintento de registro o sincronización pise permisos existentes.

### Tipos TypeScript

Actualizar `types/database.ts` o regenerarlo con Supabase CLI.

Tipos nuevos sugeridos:

```ts
export type GlobalRole = "admin" | "user";
export type SubscriptionPlan = "free" | "pro" | "business";
```

En `profiles.Row`, `profiles.Insert` y `profiles.Update` agregar:

```ts
role: GlobalRole;
plan: SubscriptionPlan;
```

## 5. Fase 2 - Seguridad y acceso

### Helper `is-admin`

Crear `lib/auth/is-admin.ts`.

```ts
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";

export const getCurrentProfile = cache(async () => {
  const user = await requireUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id,email,role,plan,created_at")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data) return null;
  return data;
});

export async function isAdmin() {
  const profile = await getCurrentProfile();
  return profile?.role === "admin";
}

export async function requireAdmin() {
  const allowed = await isAdmin();

  if (!allowed) {
    redirect("/");
  }
}
```

Este helper debe usarse en:

- `app/(app)/admin/layout.tsx`.
- `modules/admin/actions.ts`.
- Cualquier operación futura sensible.

### Protección de `/admin`

Crear `app/(app)/admin/layout.tsx`.

```tsx
import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/auth/is-admin";

type AdminLayoutProps = {
  children: ReactNode;
};

export default async function AdminLayout({ children }: AdminLayoutProps) {
  await requireAdmin();
  return children;
}
```

Esto bloquea todo lo que esté bajo `/admin`.

### Sobre `middleware.ts` en Next.js 16

MultiStock usa Next.js 16. En esta versión, la convención `middleware.ts` está deprecada a favor de `proxy.ts`.

Para este caso, la protección principal debe estar en server components y server actions, porque:

- Se puede consultar Supabase con el usuario real.
- El acceso queda bloqueado aunque el usuario escriba la URL manualmente.
- Las acciones sensibles validan permisos en backend.

Si más adelante se quiere una barrera global adicional, usar `proxy.ts` solo como filtro de sesión/ruta, no como única defensa de permisos.

## 6. Fase 3 - Panel admin

### Ruta `/admin`

Crear `app/(app)/admin/page.tsx`.

Responsabilidad:

- Métricas generales.
- Total de usuarios.
- Total de negocios.
- Usuarios por plan.
- Últimos registros.

Ejemplo:

```tsx
import { getAdminDashboard } from "@/modules/admin/actions";
import { AdminStatCard } from "@/components/admin/admin-stat-card";

export default async function AdminPage() {
  const dashboard = await getAdminDashboard();

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm text-stone-500">Administración</p>
        <h1 className="text-2xl font-semibold text-stone-950 dark:text-stone-50">
          Panel general
        </h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <AdminStatCard label="Usuarios" value={dashboard.totalUsers} />
        <AdminStatCard label="Negocios" value={dashboard.totalBusinesses} />
        <AdminStatCard label="Plan Pro" value={dashboard.usersByPlan.pro} />
      </div>
    </section>
  );
}
```

### Ruta `/admin/users`

Crear `app/(app)/admin/users/page.tsx`.

Debe mostrar:

- Email.
- Plan.
- Rol.
- Fecha de creación.
- Select para cambiar plan.
- Select para cambiar rol.

```tsx
import { getUsers } from "@/modules/admin/actions";
import { AdminUsersTable } from "@/components/admin/admin-users-table";

export default async function AdminUsersPage() {
  const users = await getUsers();

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm text-stone-500">Administración</p>
        <h1 className="text-2xl font-semibold">Usuarios</h1>
      </div>

      <AdminUsersTable users={users} />
    </section>
  );
}
```

### Ruta `/admin/businesses`

Crear `app/(app)/admin/businesses/page.tsx`.

Debe mostrar:

- Nombre del negocio.
- Email del dueño.
- Rubro.
- Plan actual del negocio.
- Fecha de creación.

```tsx
import { getBusinesses } from "@/modules/admin/actions";
import { AdminBusinessesTable } from "@/components/admin/admin-businesses-table";

export default async function AdminBusinessesPage() {
  const businesses = await getBusinesses();

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm text-stone-500">Administración</p>
        <h1 className="text-2xl font-semibold">Negocios</h1>
      </div>

      <AdminBusinessesTable businesses={businesses} />
    </section>
  );
}
```

## 7. Fase 4 - Acciones servidor

Crear `modules/admin/actions.ts`.

Todas las acciones deben:

- Usar `"use server"`.
- Ejecutar `requireAdmin()` antes de leer o modificar datos globales.
- Validar entradas con listas cerradas o Zod.
- Revalidar rutas admin después de cambios.

### Cliente admin de Supabase

Para listar todos los usuarios y negocios, las políticas RLS actuales no bastan, porque `profiles` solo permite leer el perfil propio. La opción recomendada es usar service role solo en servidor, después de validar que el usuario actual es admin.

Crear `lib/supabase/admin.ts`.

```ts
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Missing Supabase admin environment variables.");
  }

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
```

Regla crítica:

- `SUPABASE_SERVICE_ROLE_KEY` nunca debe tener prefijo `NEXT_PUBLIC_`.
- No importar `createAdminClient()` desde componentes cliente.
- Usarlo solo en server actions, route handlers o server components protegidos.

### Validaciones

Crear `lib/validations/admin.ts`.

```ts
import { z } from "zod";

export const adminPlanSchema = z.enum(["free", "pro", "business"]);
export const adminRoleSchema = z.enum(["user", "admin"]);

export const updateUserPlanSchema = z.object({
  userId: z.string().uuid(),
  plan: adminPlanSchema,
});

export const updateUserRoleSchema = z.object({
  userId: z.string().uuid(),
  role: adminRoleSchema,
});
```

### Actions principales

Ejemplo base para `modules/admin/actions.ts`.

```ts
"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/is-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  updateUserPlanSchema,
  updateUserRoleSchema,
} from "@/lib/validations/admin";

export async function getUsers() {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id,email,role,plan,created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("No se pudieron cargar los usuarios.");
  }

  return data;
}

export async function getBusinesses() {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("businesses")
    .select(`
      id,
      name,
      business_type,
      subscription_plan,
      created_at,
      owner:profiles!businesses_owner_id_fkey (
        id,
        email
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("No se pudieron cargar los negocios.");
  }

  return data;
}

export async function updateUserPlan(input: unknown) {
  await requireAdmin();
  const parsed = updateUserPlanSchema.parse(input);
  const supabase = createAdminClient();

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ plan: parsed.plan })
    .eq("id", parsed.userId);

  if (profileError) {
    throw new Error("No se pudo actualizar el plan del usuario.");
  }

  const { error: businessError } = await supabase
    .from("businesses")
    .update({ subscription_plan: parsed.plan })
    .eq("owner_id", parsed.userId);

  if (businessError) {
    throw new Error("El perfil se actualizó, pero no se pudo sincronizar el plan del negocio.");
  }

  revalidatePath("/admin");
  revalidatePath("/admin/users");
  revalidatePath("/admin/businesses");
}

export async function updateUserRole(input: unknown) {
  await requireAdmin();
  const parsed = updateUserRoleSchema.parse(input);
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("profiles")
    .update({ role: parsed.role })
    .eq("id", parsed.userId);

  if (error) {
    throw new Error("No se pudo actualizar el rol del usuario.");
  }

  revalidatePath("/admin");
  revalidatePath("/admin/users");
}
```

### Action para dashboard

```ts
export async function getAdminDashboard() {
  await requireAdmin();
  const supabase = createAdminClient();

  const [{ count: totalUsers }, { count: totalBusinesses }, { data: recentUsers }] =
    await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("businesses").select("id", { count: "exact", head: true }),
      supabase
        .from("profiles")
        .select("id,email,role,plan,created_at")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  const { data: usersByPlanRows } = await supabase
    .from("profiles")
    .select("plan");

  const usersByPlan = {
    free: 0,
    pro: 0,
    business: 0,
  };

  for (const row of usersByPlanRows ?? []) {
    usersByPlan[row.plan as keyof typeof usersByPlan] += 1;
  }

  return {
    totalUsers: totalUsers ?? 0,
    totalBusinesses: totalBusinesses ?? 0,
    usersByPlan,
    recentUsers: recentUsers ?? [],
  };
}
```

## 8. Fase 5 - Integración en la UI existente

Actualmente `app/(app)/layout.tsx` calcula la navegación con:

```ts
const navigation = getNavigationForBusinessType(
  business.business_type,
  business.subscription_plan
);
```

Para mostrar el link "Admin Panel" solo a admins:

1. Obtener perfil actual en el layout privado.
2. Pasar `isAdmin` al sidebar o agregar un item adicional antes de renderizar.
3. No confiar en esto como seguridad; es solo visibilidad.

Ejemplo conceptual:

```tsx
import { isAdmin } from "@/lib/auth/is-admin";

export default async function PrivateLayout({ children }: PrivateLayoutProps) {
  const user = await requireUser();
  const admin = await isAdmin();
  const businesses = await listUserBusinesses(user.id);
  const business = await requireActiveBusiness(user.id);

  const navigation = getNavigationForBusinessType(
    business.business_type,
    business.subscription_plan
  );

  const items = admin
    ? [...navigation, { label: "Admin Panel", href: "/admin", module: "admin" }]
    : navigation;

  return <AppShell sidebar={<AppSidebar items={items} />}>{children}</AppShell>;
}
```

Como `NavigationItem["module"]` hoy es una unión cerrada, se debe agregar `"admin"` a `AppModule` y un ícono en `components/layout/app-sidebar.tsx`.

Ejemplo:

```ts
export type AppModule =
  | "dashboard"
  | "products"
  | "inventory"
  | "sales"
  | "suppliers"
  | "alerts"
  | "audit"
  | "reports"
  | "exports"
  | "admin";
```

Y en el sidebar:

```ts
import { Shield } from "lucide-react";

const iconByModule = {
  dashboard: LayoutDashboard,
  products: Boxes,
  inventory: ClipboardList,
  sales: Receipt,
  suppliers: Truck,
  alerts: AlertTriangle,
  audit: BarChart3,
  reports: BarChart3,
  exports: Store,
  admin: Shield,
};
```

## 9. Fase 6 - Seguridad avanzada

### Backend primero

Las protecciones obligatorias son:

- `requireAdmin()` en `app/(app)/admin/layout.tsx`.
- `requireAdmin()` dentro de cada action de `modules/admin/actions.ts`.
- Validación con Zod o listas cerradas antes de modificar datos.
- Service role solo después de verificar al usuario actual con el cliente SSR normal.

### No confiar en el frontend

Ocultar el link del sidebar no protege nada. Un usuario puede escribir `/admin` manualmente o intentar invocar una server action. Por eso la validación debe vivir en servidor.

### Evitar auto-degradarse

Conviene impedir que el último admin se quite el rol por error.

Recomendación para `updateUserRole`:

```ts
if (parsed.role === "user") {
  const { count } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "admin");

  if ((count ?? 0) <= 1) {
    throw new Error("Debe existir al menos un administrador.");
  }
}
```

### Auditoría

El proyecto ya tiene módulo de auditoría. Cada cambio sensible debería registrar:

- Admin que ejecutó el cambio.
- Usuario afectado.
- Valor anterior.
- Valor nuevo.
- Fecha.

Eventos sugeridos:

- `admin.user_plan_updated`
- `admin.user_role_updated`

### RLS

Como las acciones admin usarán service role, las políticas RLS no serán la defensa principal de esas lecturas globales. Aun así, RLS debe seguir activa para clientes normales.

No se recomienda abrir `profiles` para que todos los usuarios lean todo. Si se decide hacerlo por RLS, debe ser solo con una función segura:

```sql
create or replace function public.is_system_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'admin'
  );
$$;

grant execute on function public.is_system_admin() to authenticated;
```

Y políticas específicas:

```sql
create policy "System admins can read profiles"
  on public.profiles for select
  to authenticated
  using (public.is_system_admin());
```

Si se usa service role en actions, estas políticas extra son opcionales.

## 10. Fase 7 - Buenas prácticas

### Tipado

Usar tipos centrales:

- `GlobalRole`.
- `SubscriptionPlan`.
- `Database`.

Evitar strings sueltos repetidos en componentes. Reutilizar `subscriptionPlanValues` desde `config/plans.ts` cuando sea posible.

### UI modular

Mantener componentes pequeños:

- `AdminUsersTable`: tabla.
- `UserPlanSelect`: formulario de cambio de plan.
- `UserRoleSelect`: formulario de cambio de rol.
- `AdminStatCard`: tarjeta reutilizable.

Los componentes cliente solo deben manejar interacción. La lectura y escritura sensible vive en server actions.

### Consistencia visual

Reutilizar clases y patrones de páginas actuales:

- Contenedores `section className="space-y-6"`.
- Cards con bordes, fondo claro/oscuro y radios existentes.
- Tablas simples antes de agregar abstracciones nuevas.

### Escalabilidad

Preparar el admin para crecer con secciones futuras:

- Facturación.
- Logs de auditoría.
- Soporte.
- Límites por cuenta.
- Suspensión de usuarios.

No implementar esas funciones en esta fase.

## 11. Checklist de implementación

Base de datos:

- [ ] Crear migración para `profiles.role` y `profiles.plan`.
- [ ] Agregar constraints para roles y planes.
- [ ] Agregar índices por `role`, `plan` y `created_at`.
- [ ] Actualizar `handle_new_user()` para insertar `user/free`.
- [ ] Actualizar o regenerar `types/database.ts`.

Seguridad:

- [ ] Crear `lib/auth/is-admin.ts`.
- [ ] Crear `lib/supabase/admin.ts` con `SUPABASE_SERVICE_ROLE_KEY`.
- [ ] Confirmar que `SUPABASE_SERVICE_ROLE_KEY` existe solo en servidor.
- [ ] Proteger `app/(app)/admin/layout.tsx` con `requireAdmin()`.
- [ ] Validar permisos dentro de cada action admin.
- [ ] Evitar que el último admin se quite su rol.

Acciones servidor:

- [ ] Crear `modules/admin/actions.ts`.
- [ ] Implementar `getAdminDashboard()`.
- [ ] Implementar `getUsers()`.
- [ ] Implementar `getBusinesses()`.
- [ ] Implementar `updateUserPlan(userId, plan)`.
- [ ] Implementar `updateUserRole(userId, role)`.
- [ ] Revalidar `/admin`, `/admin/users` y `/admin/businesses`.

UI:

- [ ] Crear `app/(app)/admin/page.tsx`.
- [ ] Crear `app/(app)/admin/users/page.tsx`.
- [ ] Crear `app/(app)/admin/businesses/page.tsx`.
- [ ] Crear tabla de usuarios.
- [ ] Crear tabla de negocios.
- [ ] Crear selects para plan y rol.
- [ ] Agregar link "Admin Panel" al sidebar solo para admins.
- [ ] Agregar módulo `"admin"` e ícono al sidebar.

Calidad:

- [ ] Ejecutar `npm run lint`.
- [ ] Ejecutar `npm run build`.
- [ ] Probar usuario normal entrando a `/admin`.
- [ ] Probar admin entrando a `/admin`.
- [ ] Probar cambio de plan y verificar que cambia acceso a módulos.
- [ ] Probar cambio de rol y verificar visibilidad del panel.
- [ ] Revisar que no se exponga service role al cliente.

## 12. Resultado esperado

Al finalizar:

- Un usuario normal ve la app actual sin cambios visibles.
- Un usuario normal no puede entrar a `/admin`.
- Un usuario admin ve la app normal y el link "Admin Panel".
- Un usuario admin puede listar usuarios y negocios.
- Un usuario admin puede cambiar plan y rol desde `/admin/users`.
- El cambio de plan afecta los límites actuales porque se sincroniza con `businesses.subscription_plan`.
- El sistema queda preparado para crecer sin mezclar permisos globales con permisos por negocio.

