# ARQUITECTURA v2.1 — CORRECCIÓN DE BUGS Y AJUSTES DE HORA/ALERTAS

> **Objetivo**: Corregir bugs detectados post-implementación de v2.0. Sin cambios bruscos. Sin modificar lógica de negocio existente. Sin tocar DB.
> **Stack**: Next.js 16 + Supabase + React 19 + Tailwind 4.
> **Regla de oro**: No perder funcionalidad actual. Cada fix debe ser quirúrgico.

---

## 📋 MAPA DE BUGS

| # | Bug | Gravedad | Archivos a tocar |
|---|-----|----------|-----------------|
| 1 | Productos no se crean por `categoryId = "__new__"` | 🔴 **Crítico** | `product-basic-section.tsx`, `product-form.tsx` |
| 2 | Productos no se crean por `superRefine` bloqueando en modo rápido | 🔴 **Crítico** | `product-form.tsx`, `product.ts` |
| 3 | Historial de ventas muestra hora en formato 12h am/pm (incorrecto para Chile) | 🟡 **Medio** | `sales-table.tsx` |
| 4 | Alertas en dashboard solo muestran conteo, no hay panel de alertas activas | 🟡 **Medio** | `dashboard-metrics.ts`, `dashboard/page.tsx` |
| 5 | Faltan `FormMessage` para errores de `categoryId` y `sku` en formulario | 🟠 **Alto** | `product-form.tsx` |

---

## 🔴 BUG 1 — Productos no se crean por `categoryId = "__new__"`

### Problema

Cuando el usuario crea una categoría inline (seleccionando "+ Nueva categoría"), el `<select>` de categorías queda con `value = "__new__"`. El schema de validación `productSchema` espera un UUID válido o string vacío, pero `"__new__"` no es ninguna de las dos cosas. La validación falla y el producto no se crea.

Además, el error no se muestra al usuario porque no hay `<FormMessage>` para `state?.errors?.categoryId`.

### Causa raíz

En `product-basic-section.tsx`, línea 119: el `defaultValue` se establece al renderizar. Al crear la categoría, se agrega a `localCategories` pero **el `<select>` sigue teniendo `value = "__new__"`**. No hay código que lo actualice al nuevo ID.

### Solución

**Paso 1.1** — En `components/productos/product-basic-section.tsx`, usar una `ref` para el `<select>` de categorías y actualizar su valor al crear la categoría:

Agregar `useRef` a los imports:
```tsx
import { useState, useRef } from "react";
```

Agregar la ref y variable de estado para el ID pendiente:
```tsx
const categoryRef = useRef<HTMLSelectElement>(null);
const [pendingCatId, setPendingCatId] = useState<string | null>(null);
```

Modificar `handleCreateCategory`:
```tsx
async function handleCreateCategory() {
  if (!newCatName.trim()) return;
  setCatPending(true);
  const fd = new FormData();
  fd.set("name", newCatName.trim());
  const result = await createCategoryAction(undefined, fd);
  if (result?.createdId && result?.createdName) {
    const newId = result.createdId;
    setLocalCategories((prev) => [
      ...prev,
      { id: newId, name: result.createdName! },
    ]);
    // Actualizar el select programáticamente
    setPendingCatId(newId);
    setNewCatName("");
    setShowNewCategory(false);
  }
  setCatPending(false);
}
```

Agregar un `useEffect` para cambiar el valor del select cuando se tenga un nuevo ID:
```tsx
import { useState, useRef, useEffect } from "react";

useEffect(() => {
  if (pendingCatId && categoryRef.current) {
    categoryRef.current.value = pendingCatId;
    setPendingCatId(null);
  }
}, [pendingCatId]);
```

Agregar `ref={categoryRef}` al `<select id="categoryId">`:
```tsx
<select
  id="categoryId"
  name="categoryId"
  ref={categoryRef}
  className={panelSelectClass}
  defaultValue={categoryIdDefault}
  onChange={(e) => {
    if (e.target.value === "__new__") {
      setShowNewCategory(true);
    }
  }}
>
```

**Paso 1.2** — En `components/productos/product-form.tsx`, agregar el `FormMessage` para `categoryId` (ver Bug 5).

### Riesgo
- ✅ **Bajo**. Solo afecta el flujo de creación de categoría inline. No toca DB ni otras funcionalidades.

---

## 🔴 BUG 2 — Productos no se crean por `superRefine` bloqueando en modo rápido

### Problema

En **modo rápido** (`quickMode = true`), los campos `sku` y `categoryId` se envían como `<input type="hidden">` con valor vacío. Si el usuario tampoco llena el código de barras, entonces `sku = ""` y `barcode = ""`, ambos son falsy, y el `superRefine` añade un error en `path: ["sku"]`.

Pero en modo rápido el campo SKU no es visible. El error existe pero no se muestra al usuario porque no hay `<FormMessage>` para `state?.errors?.sku`. El usuario hace clic en "Crear producto", no pasa nada, y no sabe por qué.

### Causa raíz

El `superRefine` se aplica a TODAS las validaciones sin considerar si el usuario está en modo rápido. En modo rápido, el usuario no puede llenar SKU aunque quisiera.

### Solución

**Opción recomendada (mínima):** En vez de modificar la validación, simplemente **asegurar que el error de `sku` se muestre en el formulario** (ver Bug 5). Si el usuario ve el error, puede cambiar a modo completo y llenar SKU o barcode.

**Opción adicional:** En `product-form.tsx`, cuando `quickMode` esté activo y no haya barcode, mostrar un mensaje visible:
```tsx
{quickMode && !initialProduct && (
  <p className="text-xs text-amber-600 dark:text-amber-400">
    Modo rápido: recuerda que para almacén y ferretería el SKU o código de barras es obligatorio.
  </p>
)}
```

### Archivos a modificar
- `components/productos/product-form.tsx` — agregar `FormMessage` para `sku` y mensaje informativo en modo rápido.

### Riesgo
- ✅ **Mínimo**. No cambia lógica de creación ni validación. Solo añade feedback visual.

---

## 🟡 BUG 3 — Historial de ventas muestra hora en formato 12h (am/pm)

### Problema

En `components/ventas/sales-table.tsx`, la función `formatSaleDateTime` parsea manualmente el string ISO y devuelve formato `DD-MM-AA, hh:mm:ss am/pm`.

**Chile usa formato 24h oficialmente.** El formato correcto es `DD/MM/AAAA HH:mm:ss`.

Además, el proyecto **ya tiene** una función `formatSystemDateTime` en `lib/utils.ts` que hace exactamente lo correcto con `es-CL` y `hour12: false`.

### Solución

En `components/ventas/sales-table.tsx`:

1. Cambiar el import:
```tsx
// Antes:
import { cn, formatCurrency } from "@/lib/utils";
// Después:
import { cn, formatCurrency, formatSystemDateTime } from "@/lib/utils";
```

2. **Eliminar** la función `formatSaleDateTime` completa (líneas 24-35).

3. Cambiar el uso en el render:
```tsx
// Antes:
const dateTime = formatSaleDateTime(sale.created_at);
// Después:
const dateTime = formatSystemDateTime(sale.created_at);
```

### Riesgo
- ✅ **Mínimo**. Reemplaza una función local con el helper estándar del sistema. Mismo resultado esperado pero con formato chileno correcto.

---

## 🟡 BUG 4 — Dashboard sin panel de alertas activas

### Problema

El dashboard muestra `pendingAlertsCount` como número en un `MetricCard`, pero no hay un panel que liste las alertas activas con su tipo, producto y fecha. El usuario ve "3 alertas pendientes" pero no sabe cuáles son sin ir a `/alertas`.

### Solución

**Paso 4.1** — En `lib/business/dashboard-metrics.ts`, agregar una query que obtenga las alertas activas con datos básicos:

Agregar al tipo `DashboardMetrics`:
```typescript
export type AlertPreviewRow = {
  id: string;
  type: string;
  message: string;
  created_at: string;
  productName: string | null;
};
```

Agregar al tipo `DashboardMetrics`:
```typescript
alertPreview: AlertPreviewRow[];
```

Agregar la query en `getDashboardMetrics`, dentro del `Promise.all`:
```typescript
const alertRes = await supabase
  .from("stock_alerts")
  .select("id, type, message, created_at, products(name)")
  .eq("business_id", businessId)
  .eq("resolved", false)
  .order("created_at", { ascending: false })
  .limit(5);
```

Procesar el resultado:
```typescript
const alertPreview: AlertPreviewRow[] = (alertRes.data ?? []).map((a) => ({
  id: a.id,
  type: a.type,
  message: a.message,
  created_at: a.created_at,
  productName: (a.products as { name: string } | null)?.name ?? null,
}));
```

Poblarlo en el return de `metrics`:
```typescript
return {
  businessType: type,
  metrics: {
    // ... existentes ...
    alertPreview,
  },
};
```

Y en `emptyMetrics()`:
```typescript
alertPreview: [],
```

**Paso 4.2** — Crear `components/dashboard/alert-panel.tsx`:

```tsx
import { AlertTriangle, Bell, RotateCcw, Package } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { formatSystemDateTime, cn } from "@/lib/utils";
import type { AlertPreviewRow } from "@/lib/business/dashboard-metrics";

const typeIcons: Record<string, typeof AlertTriangle> = {
  low_stock: AlertTriangle,
  out_of_stock: Package,
  perishable_warning: RotateCcw,
  waste_warning: Bell,
};

const typeColors: Record<string, string> = {
  low_stock: "text-amber-500",
  out_of_stock: "text-red-500",
  perishable_warning: "text-orange-500",
  waste_warning: "text-yellow-500",
};

type AlertPanelProps = {
  rows: AlertPreviewRow[];
  totalAlerts: number;
};

export function AlertPanel({ rows, totalAlerts }: AlertPanelProps) {
  if (!rows.length) {
    return (
      <div className="py-6 text-center text-sm text-muted-foreground">
        No hay alertas activas.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {rows.map((alert) => {
        const Icon = typeIcons[alert.type] ?? AlertTriangle;
        const color = typeColors[alert.type] ?? "text-muted-foreground";
        return (
          <div
            key={alert.id}
            className="flex items-start gap-3 rounded-lg border border-border bg-card p-3 text-card-foreground"
          >
            <Icon className={`mt-0.5 size-4 shrink-0 ${color}`} aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium leading-tight">
                {alert.productName ?? "Producto desconocido"}
              </p>
              <p className="text-xs text-muted-foreground">{alert.message}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground/70">
                {formatSystemDateTime(alert.created_at)}
              </p>
            </div>
          </div>
        );
      })}
      {totalAlerts > rows.length ? (
        <Link
          href="/alertas"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "w-full text-xs"
          )}
        >
          Ver todas ({totalAlerts})
        </Link>
      ) : null}
    </div>
  );
}
```

**Paso 4.3** — En `app/(app)/dashboard/page.tsx`, agregar el panel de alertas en la sección de la derecha (junto a "Tareas sugeridas"):

```tsx
import { AlertPanel } from "@/components/dashboard/alert-panel";
```

Y reemplazar la tarea sugerida de alertas (que actualmente solo es un link) por el panel real:

```tsx
<SimpleChartCard
  title="Alertas activas"
  description={`${metrics.pendingAlertsCount} alerta(s) sin resolver.`}
>
  <AlertPanel rows={metrics.alertPreview} totalAlerts={metrics.pendingAlertsCount} />
</SimpleChartCard>
```

Ubicarlo en el grid de la columna derecha (`lg:col-span-2`), antes de "Tareas sugeridas" o después.

**Nota de diseño**: Para el indicador visual, las alertas usan iconos con colores:
- `low_stock` → triángulo ámbar (`text-amber-500`)
- `out_of_stock` → ícono rojo (`text-red-500`)  
- `perishable_warning` → naranjo (`text-orange-500`)
- `waste_warning` → amarillo (`text-yellow-500`)

Si solo hay 1-2 alertas, el panel es pequeño y no molesta. Si hay muchas, el link "Ver todas" lleva a la página completa.

### Riesgo
- ⚠️ **Medio**. Agrega nuevas queries al dashboard y un nuevo componente. No modifica nada existente.
- La query `alertRes` se suma al `Promise.all`, no afecta las otras queries.

---

## 🟠 BUG 5 — Faltan FormMessage para errores de validación

### Problema

En `components/productos/product-form.tsx`, solo se muestran errores para: `unitType`, `costPrice`, `minStock`, `barcode`. Faltan:
- `state?.errors?.categoryId?.[0]` — Bug 1 depende de esto
- `state?.errors?.sku?.[0]` — Bug 2 depende de esto
- `state?.errors?.supplierId?.[0]`
- `state?.errors?.active?.[0]`

Sin estos, cuando la validación falla, el usuario no recibe retroalimentación.

### Solución

En `components/productos/product-form.tsx`, agregar después de la línea `<FormMessage message={state?.errors?.barcode?.[0]} />`:

```tsx
<FormMessage message={state?.errors?.categoryId?.[0]} />
<FormMessage message={state?.errors?.sku?.[0]} />
<FormMessage message={state?.errors?.supplierId?.[0]} />
```

Y opcionalmente, un mensaje informativo en modo rápido:
```tsx
{quickMode && !isEditing && businessType !== "verduleria" ? (
  <p className="text-xs text-amber-600 dark:text-amber-400">
    Atención: en modo rápido, si no ingresas código de barras, el SKU será obligatorio.
    Cambia a modo completo si necesitas agregar SKU.
  </p>
) : null}
```

### Riesgo
- ✅ **Mínimo**. Solo agrega rendering condicional. No toca lógica.

---

## 📋 VERIFICACIÓN DE FORMATO DE HORA EN TODA LA APLICACIÓN

### Estado actual

| Componente | Antes (v2.0) | Ahora | ¿Correcto para Chile? |
|-----------|--------------|-------|----------------------|
| `stock-alerts-list.tsx` | `toLocaleString(APP_LOCALE)` | `formatSystemDateTime()` | ✅ Sí (DD/MM/AAAA HH:mm:ss) |
| `movements-table.tsx` | `toLocaleString(APP_LOCALE)` | `formatSystemDateTime()` | ✅ Sí |
| `audit-table.tsx` | `toLocaleString(APP_LOCALE)` | `formatSystemDateTime()` | ✅ Sí |
| `recent-activity.tsx` | Formato custom sin segundos | `formatSystemDateTime()` | ✅ Sí |
| `ventas/[id]/page.tsx` | `toLocaleString(APP_LOCALE)` | `formatSystemDateTime()` | ✅ Sí |
| `admin-users-table.tsx` | `toLocaleString("es-CL")` | `formatSystemDateTime()` | ✅ Sí |
| **`sales-table.tsx`** | **Formato 12h am/pm** | **→ PENDIENTE** | ❌ **Se corrige en Bug 3** |
| `stock-alerts-list.tsx` (alerta) | `toLocaleString(APP_LOCALE)` | `formatSystemDateTime()` | ✅ Ya corregido en v2.0 |

### ¿Qué hace `formatSystemDateTime` exactamente?

```typescript
date.toLocaleString("es-CL", {
  year: "numeric",    // 2026
  month: "2-digit",   // 05
  day: "2-digit",     // 09
  hour: "2-digit",    // 14 (formato 24h)
  minute: "2-digit",  // 32
  second: "2-digit",  // 08
  hour12: false,      // FORZADO a 24h
});
```

Esto cumple con el formato estándar chileno: `09/05/2026, 14:32:08`.

El `es-CL` locale de Chile usa:
- Fecha: DD/MM/AAAA
- Hora: 24h (HH:mm:ss)
- Separador: `, ` (coma + espacio) entre fecha y hora

### Acción requerida

Solo queda pendiente el **Bug 3** (sales-table.tsx). Una vez corregido, TODA la aplicación usará `formatSystemDateTime` consistentemente.

---

## 📋 CHECKLIST POST-IMPLEMENTACIÓN

- [ ] `npm run build` pasa sin errores
- [ ] Al crear categoría inline en producto, el select se actualiza al nuevo ID automáticamente
- [ ] Al crear producto en modo rápido sin SKU ni barcode en almacén, se muestra error visible
- [ ] Al crear producto en modo rápido sin SKU ni barcode en verdulería, se crea sin error
- [ ] El historial de ventas muestra `DD/MM/AAAA HH:mm:ss` (24h)
- [ ] El dashboard muestra panel de alertas activas con iconos de colores
- [ ] Las alertas en el dashboard usan el formato de hora correcto
- [ ] Todas las tablas del sistema usan formato `DD/MM/AAAA HH:mm:ss`

---

## 🧠 RESUMEN DE ARCHIVOS A MODIFICAR

| Archivo | Cambio | Depende de |
|---------|--------|-----------|
| `components/productos/product-basic-section.tsx` | Ref en select + useEffect para actualizar value | Bug 1 |
| `components/productos/product-form.tsx` | + FormMessage para categoryId, sku, supplierId + aviso modo rápido | Bugs 1, 2, 5 |
| `components/ventas/sales-table.tsx` | Eliminar formatSaleDateTime local → usar formatSystemDateTime | Bug 3 |
| `lib/business/dashboard-metrics.ts` | + query alertPreview + tipo AlertPreviewRow | Bug 4 |
| `components/dashboard/alert-panel.tsx` | **Nuevo** componente | Bug 4 |
| `app/(app)/dashboard/page.tsx` | + import AlertPanel + renderizar sección | Bug 4 |

> **Documento generado el 09/05/2026** — Basado en revisión de bugs post-v2.0.
> **Filosofía**: Correcciones quirúrgicas. Sin cambios de lógica. Sin tocar DB. Sin reescribir componentes existentes.
