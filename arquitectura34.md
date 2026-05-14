# arquitectura34.md — Corrección de invitaciones y estabilización del multiusuario

## Contexto

El usuario reporta el mensaje **"Error al crear la invitación. Intenta de nuevo."** al intentar invitar
a alguien que NO tiene cuenta en MultiStock.

Además, se detectaron otros problemas colaterales en el sistema multiusuario.

---

## 🔍 Diagnóstico del error

### Causa 1 (🔴 Alta) — Tabla `pending_invitations` no existe en BD

El archivo `supabase/migrations/20260513180000_pending_invitations.sql` se creó y comiteó,
pero **no fue aplicado al SQL Editor de Supabase**.

Cuando la server action ejecuta:

```ts
await supabase.from("pending_invitations").insert({...})
```

Supabase devuelve error porque la tabla no existe.

**Solución:** Aplicar la migración.

---

### Causa 2 (🟡 Media) — RLS `is_business_admin()` con `security definer` puede fallar

La función `is_business_admin()` (creada en migración `20260503003000`) tiene esta firma:

```sql
security definer
set search_path = public
```

El `set search_path = public` excluye el schema `auth`, lo que hace que `auth.uid()`
dependa de la resolución por nombre completo. Aunque está escrita como `(select auth.uid())`
— que es nombre completo — en contextos `security definer` la función `auth.uid()` puede
retornar `NULL` porque la sesión JWT del usuario autenticado NO se transmite al contexto
del definer.

Esto NO ha roto antes porque `is_business_admin` se usa con `using (...)` en RLS de tablas
ya existentes (products, sales, etc.). Pero en `pending_invitations` es la primera vez que
se usa `with check (is_business_admin(...))` en una tabla nueva, y el comportamiento podría
diferir.

**Solución:** Cambiar `is_business_admin()` a `security invoker` para heredar la sesión
del usuario autenticado.

**Riesgo:** Al cambiar a `security invoker`, la función debe ser owned por un rol que tenga
los permisos adecuados. El dueño por defecto (postgres / service_role) ya tiene acceso.

---

### Causa 3 (🟢 Baja) — `requireBusinessRole` no depende del RPC pero hay asimetría

Tras nuestro cambio, `getBusinessRole()` ahora consulta directamente:

1. `businesses.owner_id` → si coincide, retorna `"owner"`
2. `business_users.role` → si no es owner busca aquí

Esto funciona correctamente. No es la causa del error.

---

### Causa 4 (🟡 Media) — Sin logging, el error genérico oculta la causa real

En `team/actions.ts` línea 119:

```ts
if (inviteError) {
    return { message: "Error al crear la invitación. Intenta de nuevo." };
}
```

Se pierde el mensaje real de Supabase. Nunca podemos saber si es tabla faltante,
unique constraint, RLS, FK, etc.

**Solución:** Incluir el error en consola y mostrarlo al desarrollador/admin,
sin exponer detalles internos al usuario final.

---

### Causa 5 (🟢 Baja) — Posible unique constraint violation si se reintenta rápido

La constraint `unique(business_id, email)` evita duplicados. La validación previa en
líneas 99-108 lo chequea, pero una race condition (doble click rápido) podría pasar
la validación antes de que el primer INSERT termine.

**Solución:** Usar `onConflict: "business_id,email"` con `ignoreDuplicates`.

---

## 🧪 Otros problemas detectados en el sistema multiusuario

### Problema 1 — Label legacy `"admin"` en `team-member-row.tsx`

```ts
member.role === "admin" ? "Admin" : "Empleado"
```

Ya no existe `role = 'admin'` en `business_users` tras la migración de simplificación.
Fue corregido en commit `52892c4`. ✅

### Problema 2 — `is_business_admin` SQL referencia `'admin'` en `in ('owner', 'admin')`

Línea 43 del archivo `20260503003000_allow_business_owner_in_rls_helpers.sql`:

```sql
and bu.role in ('owner', 'admin')
```

No hay registros con `role = 'admin'`, pero el código SQL es engañoso.
**No es urgente**, pero confunde al leer.

### Problema 3 — Employee puede ver la página `/equipo` por URL directa

El layout del sidebar oculta "Equipo" para employee, pero la página `/equipo/page.tsx`
usa `requirePageAccess(["owner"])` que sí redirige al dashboard. Está bien protegido. ✅

### Problema 4 — En `lib/auth/actions.ts` (register) se usa `await supabase.auth.getUser()`

Después de `signInWithPassword`, se llama a `supabase.auth.getUser()` para obtener el
`userId`. Pero `supabase.auth.getUser()` puede fallar tras un signUp + signIn reciente
porque la sesión local puede no estar propagada. **Riesgo de null pointer.**

---

## ▶ FASES DE CORRECCIÓN

### FASE 1 — Aplicar migración y arreglar RLS (urgente)

**Objetivo:** Hacer que la invitación funcione.

#### Paso 1.1 — Aplicar migración `20260513180000_pending_invitations.sql`

Ejecutar en SQL Editor de Supabase el contenido del archivo.

#### Paso 1.2 — Arreglar `is_business_admin()` a `security invoker`

Crear migración `20260514000000_fix_is_business_admin_invoker.sql`:

```sql
-- ============================================
-- Fix: cambiar is_business_member y is_business_admin a security invoker
-- ============================================
-- El security definer con set search_path = public puede hacer que auth.uid()
-- retorne NULL en ciertos contextos (tablas nuevas, with check policies).
-- Al usar security invoker hereda la sesión JWT del usuario autenticado.

create or replace function public.is_business_member(p_business_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select exists (
    select 1
    from public.businesses b
    where b.id = p_business_id
      and b.owner_id = (select auth.uid())
  )
  or exists (
    select 1
    from public.business_users bu
    where bu.business_id = p_business_id
      and bu.user_id = (select auth.uid())
  );
$$;

create or replace function public.is_business_admin(p_business_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select exists (
    select 1
    from public.businesses b
    where b.id = p_business_id
      and b.owner_id = (select auth.uid())
  )
  or exists (
    select 1
    from public.business_users bu
    where bu.business_id = p_business_id
      and bu.user_id = (select auth.uid())
      and bu.role in ('owner', 'admin')
  );
$$;
```

#### Paso 1.3 — Agregar policy de UPDATE a `pending_invitations`

La migración actual tiene SELECT, INSERT y DELETE, pero no UPDATE.
Si en el futuro se necesita modificar una invitación, no será posible.
Agregar policy opcional.

---

### FASE 2 — Mejorar logging y robustez en server actions

**Objetivo:** Poder diagnosticar errores sin adivinar.

#### Paso 2.1 — Agregar `console.error` con el mensaje real de Supabase

En `modules/core/team/actions.ts`, en cada bloque donde se captura error:

```ts
if (inviteError) {
    console.error("inviteMemberAction (pending_invitations):", inviteError);
    return { message: "Error al crear la invitación. Intenta de nuevo." };
}
```

#### Paso 2.2 — Usar `upsert` con `onConflict` para evitar race conditions

```ts
const { error: inviteError } = await supabase
    .from("pending_invitations")
    .upsert({
      business_id: business.id,
      email,
      role: "employee",
      invited_by: user.id,
    }, {
      onConflict: "business_id,email",
      ignoreDuplicates: true,
    });
```

Esto evita duplicados incluso con doble click rápido.

---

### FASE 3 — Arreglar registro de invitados

**Objetivo:** Que el empleado invitado se registre y sea redirigido al dashboard.

#### Paso 3.1 — Reemplazar `getUser()` por `user` del login

En `lib/auth/actions.ts`, el bloque problemático:

```ts
const user = await supabase.auth.getUser();
const userId = user.data.user?.id;

if (userId) {
    for (const invite of pendingInvites) {
        await supabase.from("business_users").upsert(...)
    }
}
```

Problema: `getUser()` lee la sesión local que puede no estar disponible justo después
del login. Cambiar a usar el parsed.email para buscar en `profiles`:

```ts
// Buscar el perfil recién creado por email
const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", parsed.data.email)
    .maybeSingle();

if (profile) {
    for (const invite of pendingInvites) {
        await supabase.from("business_users").upsert(
            { business_id: invite.business_id, user_id: profile.id, role: "employee" },
            { onConflict: "business_id,user_id", ignoreDuplicates: true }
        );
    }
    await supabase
        .from("pending_invitations")
        .delete()
        .eq("email", parsed.data.email);
}
```

---

### FASE 4 — Arreglar `registerAction` para que muestre mensaje si hay error

Actualmente, si el upsert falla (por ejemplo por RLS), no se informa.
Agregar validación de error en cada upsert.

---

### FASE 5 — Verificación final

| Test | Resultado esperado |
|---|---|
| Owner invita email SIN cuenta | ✅ "Invitación enviada correctamente." |
| Owner invita mismo email otra vez | ✅ "Ya existe una invitación pendiente para este email." |
| Owner invita email CON cuenta | ✅ "Empleado agregado correctamente." |
| Owner invita email ya miembro | ✅ "El usuario ya es miembro de este negocio." |
| Owner cancela invitación pendiente | ✅ "Invitación cancelada." |
| Owner ve invitación en UI | ✅ Aparece sección "Invitaciones pendientes" |
| Empleado se registra con email invitado | ✅ Va al dashboard, no al onboarding |
| Employee NO puede invitar | ✅ redirect dashboard (requirePageAccess) |
| `npx tsc --noEmit` | ✅ 0 errores |
| Migraciones aplicadas | ✅ tabla + RLS + index en BD |

---

## 📋 Archivos a modificar

| Archivo | Fase | Cambio |
|---|---|---|
| `supabase/migrations/20260513180000_pending_invitations.sql` | F1 | Aplicar en SQL Editor (ningún cambio de código) |
| `supabase/migrations/20260514000000_fix_is_business_admin_invoker.sql` | F1.2 | Nueva migración: cambiar a `security invoker` |
| `modules/core/team/actions.ts` | F2 | Agregar `console.error`, usar `upsert` con `onConflict` |
| `lib/auth/actions.ts` | F3 | Reemplazar `getUser()` por query a `profiles` |
| `lib/auth/actions.ts` | F4 | Agregar detección de errores en upsert |

---

## 🚨 Riesgos

| Riesgo | Probabilidad | Mitigación |
|---|---|---|
| Cambiar `security definer` → `security invoker` rompe RLS existente | Baja | Testear con owner y employee en productos/ventas después del cambio |
| `upsert` con `ignoreDuplicates` no retorna error pero tampoco inserta | Baja | La validación previa con `maybeSingle` ya chequea existencia |
| El profile recién creado no aparece en query de `profiles` por replicación | Baja | Puede haber delay de replicación en auth.users → profiles (trigger `handle_new_user`). Esperar 1-2 segundos o reintentar |

---

## 🟢 Conclusión

La causa raíz más probable es **la migración no aplicada**. Pero hay que corregir
también la función `is_business_admin` a `security invoker` para prevenir problemas
futuros con tablas nuevas.

Prioridad:

1. Aplicar migración `pending_invitations` (1 minuto)
2. Crear y aplicar migración `fix_is_business_admin_invoker` (2 minutos)
3. Mejorar logging y robustez (10 minutos de código)
4. Arreglar registro de invitados (10 minutos de código)
5. Pruebas de regresión (15 minutos)
