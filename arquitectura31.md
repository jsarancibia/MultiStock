# arquitectura31.md — Protección de páginas y atomicidad de ventas

## Diagnóstico

### Problema 1 — Páginas desprotegidas

Actualmente la protección por roles está en:
- ✅ **Navegación sidebar** — Employee no ve módulos no permitidos
- ✅ **Server Actions** — Protegidas con `requireBusinessRole()`
- ✅ **RLS en BD** — Employee no puede INSERT/UPDATE/DELETE en tablas restringidas
- ❌ **Páginas (Server Components)** — Sin protección directa

Un empleado puede escribir la URL manualmente:

| Página | Qué pasa si employee entra |
|---|---|
| `/equipo` | `listTeamMembers()` lanza error → crash feo |
| `/proveedores` | RLS bloquea SELECT → tabla vacía |
| `/proveedores/nuevo` | RLS bloquea INSERT al enviar |
| `/proveedores/[id]/editar` | RLS bloquea todo |
| `/auditoria` | RLS bloquea SELECT → tabla vacía |
| `/exportaciones` | Exporta datos que no debería ver |
| `/reportes` | Ve reportes que no debería |
| `/productos/nuevo` | Ve formulario, action lo rechaza |
| `/productos/[id]/editar` | Ve formulario, action lo rechaza |
| `/inventario/movimientos/nuevo` | Ve formulario, action lo rechaza |

### Problema 2 — Venta + stock NO es transaccional segura

La función `create_sale_with_items()` tiene `security invoker`:

```sql
security invoker  -- La función corre con permisos del usuario que la llama
```

Con las nuevas RLS restrictivas:

| Operación dentro de la RPC | Owner | Employee |
|---|---|---|
| INSERT en `sales` | ✅ | ✅ |
| INSERT en `sale_items` | ✅ | ✅ |
| INSERT en `stock_movements` | ✅ | **❌ BLOQUEADO** |
| UPDATE en `products` (stock) | ✅ | **❌ BLOQUEADO** |

**Resultado:** Un employee **no puede crear ventas**. La RPC falla al intentar insertar `stock_movements` o actualizar `products`.

**Además:** Aunque todo estuviera en una transacción (y lo está, porque PL/pgSQL envuelve todo en una transacción implícita), `security invoker` hace que PostgreSQL evalúe RLS por cada instrucción. Si alguna RLS bloquea, toda la transacción se revierte, pero el problema es que **nunca llega a ejecutarse** porque la validación RLS ocurre antes.

---

## Plan de implementación

## FASE 1 — Crear `create_sale_with_items()` como `security definer`

### Archivo a crear

```
supabase/migrations/20260510130000_fix_create_sale_security_definer.sql
```

### Arquitectura de la RPC

```
employee crea venta
  │
  ▼
RPC create_sale_with_items()
  │
  ├─ SECURITY DEFINER  ← corre con permisos del dueño de la función
  ├─ set search_path = public  ← fijo, no inyectable
  │
  ├─ 1. Validar auth.uid() no sea null
  ├─ 2. Validar is_business_member(p_business_id)
  ├─ 3. Validar p_items sea array no vacío
  ├─ 4. Bucle 1: VALIDACIÓN + LOCK (FOR UPDATE)
  │     ├─ ¿Producto existe en este negocio?
  │     ├─ ¿Producto activo?
  │     ├─ ¿Cantidad válida para la unidad?
  │     ├─ ¿Stock suficiente?
  │     └─ FOR UPDATE → bloquea la fila
  ├─ 5. INSERT sale
  ├─ 6. Bucle 2: EJECUCIÓN
  │     ├─ FOR UPDATE (re-lock, ya estaba bloqueado)
  │     ├─ Calcular precio, subtotal
  │     ├─ INSERT sale_item
  │     ├─ UPDATE product stock
  │     ├─ INSERT stock_movement
  │     └─ Sincronizar low_stock_alert
  ├─ 7. UPDATE sale total
  └─ 8. RETURN sale_id

Si falla algo → todo rollback automático
```

### SQL de la migración

```sql
-- Cambiar create_sale_with_items a security definer.
-- Con RLS restrictivas, employee no puede insertar stock_movements ni actualizar stock.
-- Al usar security definer, la función corre con permisos elevados PERO
-- mantiene todas las validaciones de negocio dentro de la función.

-- ¡ATENCIÓN! La firma debe coincidir con PostgREST:
-- orden alfabético de parámetros → (p_business_id uuid, p_created_by uuid, p_items jsonb, p_payment_method text)
-- que PostgREST resuelve como (uuid, uuid, jsonb, text).

create or replace function public.create_sale_with_items(
  p_business_id uuid,
  p_created_by uuid,
  p_items jsonb,
  p_payment_method text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sale_id uuid;
  v_total numeric(14, 4) := 0;
  v_item jsonb;
  v_product_id uuid;
  v_quantity numeric(14, 4);
  v_unit_price numeric(14, 4);
  v_subtotal numeric(14, 4);
  v_product record;
  v_new_stock numeric(14, 4);
begin
  -- ──────────────────────────────────────────────────
  -- 1. Validar autenticación
  -- ──────────────────────────────────────────────────
  if auth.uid() is null then
    raise exception 'No autenticado';
  end if;

  -- ──────────────────────────────────────────────────
  -- 2. Validar pertenencia al negocio
  --    (aunque security definer, NO confiamos en el business_id ciegamente)
  -- ──────────────────────────────────────────────────
  if not public.is_business_member(p_business_id) then
    raise exception 'No autorizado para este negocio';
  end if;

  -- ──────────────────────────────────────────────────
  -- 3. Validar payload
  -- ──────────────────────────────────────────────────
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'La venta debe incluir al menos un item';
  end if;

  -- ──────────────────────────────────────────────────
  -- 4. Bucle 1: Validar + LOCK (FOR UPDATE)
  --    Aquí bloqueamos TODOS los productos antes de escribir.
  --    Si dos empleados venden el mismo producto simultáneamente,
  --    el segundo espera hasta que el primero termine (COMMIT o ROLLBACK).
  -- ──────────────────────────────────────────────────
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_product_id := (v_item->>'product_id')::uuid;
    v_quantity := (v_item->>'quantity')::numeric;

    if v_quantity is null or v_quantity <= 0 then
      raise exception 'Cantidad invalida en item de venta';
    end if;

    select id, active, unit_type, current_stock, min_stock, sale_price
      into v_product
    from public.products
    where id = v_product_id
      and business_id = p_business_id
    for update;  -- ← BLOQUEA la fila hasta que termine la transacción

    if not found then
      raise exception 'Producto no encontrado para la venta';
    end if;

    if not v_product.active then
      raise exception 'No se puede vender un producto inactivo';
    end if;

    if v_product.unit_type not in ('kg', 'g', 'liter', 'meter')
       and trunc(v_quantity) <> v_quantity
    then
      raise exception 'Cantidad decimal no permitida para unidad %', v_product.unit_type;
    end if;

    if v_quantity > v_product.current_stock then
      raise exception 'Stock insuficiente para producto %', v_product.id;
    end if;
  end loop;

  -- ──────────────────────────────────────────────────
  -- 5. Crear la venta (total 0, se actualiza después)
  -- ──────────────────────────────────────────────────
  insert into public.sales (business_id, total, payment_method, created_by)
  values (p_business_id, 0, p_payment_method, p_created_by)
  returning id into v_sale_id;

  -- ──────────────────────────────────────────────────
  -- 6. Bucle 2: Ejecutar items (productos ya están bloqueados)
  -- ──────────────────────────────────────────────────
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_product_id := (v_item->>'product_id')::uuid;
    v_quantity := (v_item->>'quantity')::numeric;

    -- Re-select (el FOR UPDATE re-adquiere el lock, ya está bloqueado)
    select id, current_stock, min_stock, sale_price
      into v_product
    from public.products
    where id = v_product_id
      and business_id = p_business_id
    for update;

    -- Usar el precio enviado, o el precio de venta del producto
    v_unit_price := coalesce(nullif(v_item->>'unit_price', '')::numeric, v_product.sale_price);
    v_subtotal := v_quantity * v_unit_price;
    v_total := v_total + v_subtotal;
    v_new_stock := v_product.current_stock - v_quantity;

    -- Insertar item de venta
    insert into public.sale_items (sale_id, product_id, quantity, unit_price, subtotal)
    values (v_sale_id, v_product_id, v_quantity, v_unit_price, v_subtotal);

    -- Descontar stock del producto
    update public.products
    set current_stock = v_new_stock
    where id = v_product_id
      and business_id = p_business_id;

    -- Registrar movimiento de stock
    insert into public.stock_movements (business_id, product_id, type, quantity, reason, created_by)
    values (
      p_business_id,
      v_product_id,
      'sale',
      (v_quantity * -1),
      format('Venta %s', v_sale_id),
      p_created_by
    );

    -- Sincronizar alerta de stock bajo
    if v_new_stock <= v_product.min_stock then
      if not exists (
        select 1
        from public.stock_alerts sa
        where sa.business_id = p_business_id
          and sa.product_id = v_product_id
          and sa.type = 'low_stock'
          and sa.resolved = false
      ) then
        insert into public.stock_alerts (business_id, product_id, type, message, resolved)
        values (
          p_business_id,
          v_product_id,
          'low_stock',
          'Producto en o por debajo de stock minimo.',
          false
        );
      end if;
    else
      update public.stock_alerts
      set resolved = true
      where business_id = p_business_id
        and product_id = v_product_id
        and type = 'low_stock'
        and resolved = false;
    end if;
  end loop;

  -- ──────────────────────────────────────────────────
  -- 7. Actualizar total de la venta
  -- ──────────────────────────────────────────────────
  update public.sales
  set total = v_total
  where id = v_sale_id;

  -- ──────────────────────────────────────────────────
  -- 8. Retornar ID de la venta creada
  -- ──────────────────────────────────────────────────
  return v_sale_id;
end;
$$;

grant execute on function public.create_sale_with_items(uuid, uuid, jsonb, text) to authenticated;
```

### ¿Por qué es seguro `security definer`?

| Protección | ¿Está en la función? |
|---|---|
| Valida `auth.uid()` no sea null | ✅ |
| Valida `is_business_member()` | ✅ |
| Valida stock suficiente | ✅ |
| Valida producto activo | ✅ |
| Valida cantidad válida para la unidad | ✅ |
| `SELECT ... FOR UPDATE` (lock concurrente) | ✅ |
| `set search_path = public` (fijo) | ✅ |
| Todo en una sola transacción | ✅ (PL/pgSQL envuelve todo en 1 transacción) |
| No confía ciegamente en `business_id` | ✅ (valida contra la BD) |

---

## FASE 2 — Helper para proteger páginas

### Archivo nuevo

```
lib/auth/require-page-access.ts
```

```ts
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { requireActiveBusiness } from "@/lib/business/get-active-business";
import { getBusinessRole, type BusinessRole } from "@/lib/auth/require-business-role";

/**
 * Protege páginas completas (Server Components) por rol.
 * Si el usuario no tiene un rol permitido, redirige al dashboard.
 * A diferencia de requireBusinessRole(), esto NO lanza error, sino que redirige.
 */
export async function requirePageAccess(allowedRoles: BusinessRole[]) {
  const user = await requireUser();
  const business = await requireActiveBusiness(user.id);
  const role = await getBusinessRole(user.id, business.id);

  if (!role || !allowedRoles.includes(role)) {
    redirect("/dashboard");
  }

  return { user, business, role };
}
```

---

## FASE 3 — Proteger páginas individuales

### 3.1 `/equipo` — solo owner

```tsx
// app/(app)/equipo/page.tsx
import { requirePageAccess } from "@/lib/auth/require-page-access";
import { TeamPage } from "@/components/team/team-page";

export default async function Page() {
  await requirePageAccess(["owner"]);
  return <TeamPage />;
}
```

### 3.2 Proveedores — solo owner

```tsx
// app/(app)/proveedores/page.tsx
export default async function ProveedoresPage() {
  await requirePageAccess(["owner"]);
  const access = await getPlanModuleAccess("suppliers");
  // ... resto igual
}
```

```tsx
// app/(app)/proveedores/nuevo/page.tsx
export default async function NuevoProveedorPage() {
  await requirePageAccess(["owner"]);
  const access = await getPlanModuleAccess("suppliers");
  // ... resto igual
}
```

```tsx
// app/(app)/proveedores/[id]/editar/page.tsx
export default async function EditarProveedorPage() {
  await requirePageAccess(["owner"]);
  const access = await getPlanModuleAccess("suppliers");
  // ... resto igual
}
```

### 3.3 `/auditoria` — solo owner

```tsx
// app/(app)/auditoria/page.tsx
export default async function AuditoriaPage() {
  await requirePageAccess(["owner"]);
  const access = await getPlanModuleAccess("audit");
  // ... resto igual
}
```

### 3.4 `/exportaciones` — solo owner

```tsx
// app/(app)/exportaciones/page.tsx
export default async function ExportacionesPage() {
  await requirePageAccess(["owner"]);
  const access = await getPlanModuleAccess("exports");
  // ... resto igual
}
```

### 3.5 `/reportes` — solo owner

```tsx
// app/(app)/reportes/page.tsx
export default async function ReportesPage() {
  await requirePageAccess(["owner"]);
  const access = await getPlanModuleAccess("reports");
  // ... resto igual
}
```

### 3.6 `/productos/nuevo` — solo owner

```tsx
// app/(app)/productos/nuevo/page.tsx
export default async function NuevoProductoPage() {
  await requirePageAccess(["owner"]);
  const { business, categories, suppliers } = await getProductFormData();
  // ... resto igual
}
```

### 3.7 `/productos/[id]/editar` — solo owner

```tsx
// app/(app)/productos/[id]/editar/page.tsx
export default async function EditarProductoPage() {
  await requirePageAccess(["owner"]);
  const { id } = await params;
  // ... resto igual
}
```

### 3.8 `/inventario/movimientos/nuevo` — solo owner

```tsx
// app/(app)/inventario/movimientos/nuevo/page.tsx
export default async function NuevoMovimientoPage() {
  await requirePageAccess(["owner"]);
  const { products } = await getMovementFormData();
  // ... resto igual
}
```

---

## FASE 4 — Consideraciones de rendimiento

Cada `requirePageAccess()` hace 3 queries:
1. `requireUser()` → SELECT en auth.users (cacheado con React `cache()`)
2. `requireActiveBusiness()` → SELECT en businesses
3. `getBusinessRole()` → RPC → SELECT en business_users / businesses

Aceptable porque:
- Son queries simples con índices
- Solo afecta a páginas que employee no debería visitar
- No hay impacto en páginas públicas o páginas de employee

---

## Resumen de cambios

| Archivo | Cambio |
|---|---|
| `supabase/migrations/20260510130000_fix_create_sale_security_definer.sql` | Nueva migración: RPC con `security definer` + todas las validaciones |
| `lib/auth/require-page-access.ts` | Nuevo helper: `requirePageAccess()` |
| `app/(app)/equipo/page.tsx` | Agregar `requirePageAccess(["owner"])` |
| `app/(app)/proveedores/page.tsx` | Agregar `requirePageAccess(["owner"])` |
| `app/(app)/proveedores/nuevo/page.tsx` | Agregar `requirePageAccess(["owner"])` |
| `app/(app)/proveedores/[id]/editar/page.tsx` | Agregar `requirePageAccess(["owner"])` |
| `app/(app)/auditoria/page.tsx` | Agregar `requirePageAccess(["owner"])` |
| `app/(app)/exportaciones/page.tsx` | Agregar `requirePageAccess(["owner"])` |
| `app/(app)/reportes/page.tsx` | Agregar `requirePageAccess(["owner"])` |
| `app/(app)/productos/nuevo/page.tsx` | Agregar `requirePageAccess(["owner"])` |
| `app/(app)/productos/[id]/editar/page.tsx` | Agregar `requirePageAccess(["owner"])` |
| `app/(app)/inventario/movimientos/nuevo/page.tsx` | Agregar `requirePageAccess(["owner"])` |

**Nota:** Las páginas públicas de employee (`/productos`, `/productos/[id]`, `/inventario`, `/ventas`) NO se protegen porque employee debe poder ver y usar esos módulos.
