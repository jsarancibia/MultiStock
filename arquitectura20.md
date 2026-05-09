# ARQUITECTURA v2.0 — IMPLEMENTACIÓN GUIADA

> 🎯 **Objetivo**: Solo añadir. No modificar lógica existente, no cambiar UI actual, no tocar DB.
> ⛔ **Regla de oro**: Si un cambio requiere reescribir un componente entero o modificar una server action existente → repensar. Debe ser un añadido, no una modificación.
> 🤖 **Para modelo**: DeepSeek V4 Pro (recomendado). V4 Flash para tareas aisladas (Fase 1, Fase 8).
> 📅 **Documento generado**: 09/05/2026 — Revisión contra 120+ archivos del código real.

---

## 📋 MAPA DE IMPLEMENTACIÓN

| # | Fase | Archivos a tocar | Tipo | Depende de | Modelo recomendado |
|---|------|-----------------|------|-----------|-------------------|
| 1 | Formato hora | `lib/utils.ts` + 6 componentes | Helper + reemplazo | Ninguna | Flash ✅ |
| 2 | Toast registro | `package.json` + `layout.tsx` + `register-form.tsx` | Añadir librería + componente | Ninguna | Flash ✅ |
| 3 | SKU/barcode obligatorio | `lib/validations/product.ts` | Añadir validación | Ninguna | Pro ✅ |
| 4 | Badge alertas | `layout.tsx` + `app-sidebar.tsx` | Añadir query + badge | Ninguna | Flash ✅ |
| 5 | Agregar stock rápido | Nuevo componente + `stock-table.tsx` + server action | Nuevo componente + reutilizar lógica | Ninguna | Pro ✅ |
| 6 | Categoría inline | `product-basic-section.tsx` + `categories/actions.ts` | Añadir inline | Ninguna | Pro ✅ |

---

## 🟢 FASE 1 — FORMATO DE HORA (V4 Flash)

### Qué NO hacer
- No cambiar la estructura del proyecto.
- No instalar dependencias.
- No modificar DB ni schemas.

### Qué SÍ hacer

**Paso 1.1** — En `lib/utils.ts`, agregar **al final del archivo** (después de `asciiFileSlug`) dos funciones nuevas:

```typescript
/** Formato estándar del sistema: DD/MM/AAAA HH:mm:ss */
export function formatSystemDateTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString("es-CL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}
```

No borrar nada existente en el archivo.

**Paso 1.2** — Buscar en estos 6 archivos el patrón `new Date(...).toLocaleString(APP_LOCALE)` o `new Date(...).toLocaleString("es-CL")` y **reemplazar SOLO la llamada**, sin tocar nada más del archivo:

| Archivo | Buscar | Reemplazar con |
|---------|--------|---------------|
| `components/alertas/stock-alerts-list.tsx` | `new Date(alert.created_at).toLocaleString(APP_LOCALE)` | `formatSystemDateTime(alert.created_at)` |
| `components/inventario/movements-table.tsx` | `new Date(movement.created_at).toLocaleString(APP_LOCALE)` | `formatSystemDateTime(movement.created_at)` |
| `components/auditoria/audit-table.tsx` | `new Date(row.created_at).toLocaleString(APP_LOCALE)` | `formatSystemDateTime(row.created_at)` |
| `components/dashboard/recent-activity.tsx` | El bloque `toLocaleString(APP_LOCALE, { day: ..., month: ..., hour: ..., minute: ... })` (aparece 2 veces) | `formatSystemDateTime(item.at)` |
| `app/(app)/ventas/[id]/page.tsx` | `new Date(sale.created_at).toLocaleString(APP_LOCALE)` | `formatSystemDateTime(sale.created_at)` |
| `components/admin/admin-users-table.tsx` | `new Date(value).toLocaleString("es-CL")` | `formatSystemDateTime(value)` |

**Paso 1.3** — Verificar que el import `formatSystemDateTime` esté presente en cada archivo donde se usó. Si el archivo ya importa desde `@/lib/utils`, solo agregar `formatSystemDateTime` a la lista de imports.

---

## 🟢 FASE 2 — TOAST AL CREAR CUENTA (V4 Flash)

### Qué NO hacer
- No cambiar la lógica de `registerAction` (archivo `lib/auth/actions.ts`).
- No cambiar el formulario de login.
- No cambiar la estructura de `RegisterForm` más allá de lo indicado.

### Qué SÍ hacer

**Paso 2.1** — Ejecutar:
```bash
npm install sonner
```

**Paso 2.2** — En `app/layout.tsx` (el root layout, no el layout protegido):
- Importar `Toaster` de `sonner`.
- Agregar `<Toaster />` **dentro del body**, idealmente antes de `</body>` o después del `{children}`.

Configuración exacta:
```tsx
<Toaster position="top-right" richColors closeButton duration={4500} />
```

**Paso 2.3** — En `components/forms/register-form.tsx`:
- Agregar `"use client"` (ya está).
- Importar `toast` de `"sonner"`.
- Importar `useRouter` de `"next/navigation"`.
- Importar `useEffect` de `"react"` (verificar si ya está importado).
- Dentro del componente, después del `useActionState`, agregar:

```tsx
const router = useRouter();

useEffect(() => {
  if (state?.message?.includes("Cuenta creada")) {
    toast.success(state.message);
    router.push("/auth/login");
  }
}, [state, router]);
```

- **IMPORTANTE**: No borrar `<FormMessage message={state?.message} />`. El toast es adicional, no reemplaza.

---

## 🟢 FASE 3 — SKU/BARCODE OBLIGATORIO (V4 Pro)

### Qué NO hacer
- No modificar DB.
- No modificar server actions de productos (`modules/core/products/actions.ts`).
- No modificar ProductBasicSection ni el formulario.

### Qué SÍ hacer

En `lib/validations/product.ts`:

**Paso 3.1** — Reemplazar el `productSchema` actual por uno equivalente PERO con `superRefine`:

El schema actual es:
```typescript
export const productSchema = z.object({
  name: z.string().min(2, "El nombre es obligatorio."),
  categoryId: z.string().uuid().optional().or(z.literal("")),
  supplierId: z.string().uuid().optional().or(z.literal("")),
  sku: z.string().max(120).optional().or(z.literal("")),
  barcode: barcodeFieldSchema,
  unitType: z.enum(unitTypeValues, { message: "Unidad invalida." }),
  costPrice: z.coerce.number().min(0, "Costo invalido."),
  salePrice: z.coerce.number().min(0, "Precio de venta invalido."),
  minStock: z.coerce.number().min(0, "Stock minimo invalido."),
  currentStock: z.coerce.number().min(0, "Stock actual invalido."),
  active: z.coerce.boolean().default(true),
  businessType: z.enum(businessTypeValues),
  metadata: productMetadataSchema,
});
```

Debe quedar así (cambiar `.object({...})` por `.object({...}).superRefine(...)`):

```typescript
export const productSchema = z.object({
  name: z.string().min(2, "El nombre es obligatorio."),
  categoryId: z.string().uuid().optional().or(z.literal("")),
  supplierId: z.string().uuid().optional().or(z.literal("")),
  sku: z.string().max(120).optional().or(z.literal("")),
  barcode: barcodeFieldSchema,
  unitType: z.enum(unitTypeValues, { message: "Unidad invalida." }),
  costPrice: z.coerce.number().min(0, "Costo invalido."),
  salePrice: z.coerce.number().min(0, "Precio de venta invalido."),
  minStock: z.coerce.number().min(0, "Stock minimo invalido."),
  currentStock: z.coerce.number().min(0, "Stock actual invalido."),
  active: z.coerce.boolean().default(true),
  businessType: z.enum(businessTypeValues),
  metadata: productMetadataSchema,
}).superRefine((data, ctx) => {
  // Verdulería: SKU y barcode son opcionales
  if (data.businessType === "verduleria") return;

  // Almacén y ferretería: al menos uno obligatorio
  if (!data.sku && !data.barcode) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "El producto debe tener al menos un identificador (SKU o código de barras).",
      path: ["sku"],
    });
  }
});
```

No borrar ningún otro tipo o export del archivo.

---

## 🟢 FASE 4 — BADGE DE ALERTAS EN SIDEBAR (V4 Flash)

### Qué NO hacer
- No cambiar `AppSidebar` más de lo necesario (solo agregar badge en el ítem Alertas).
- No cambiar la lógica de alertas existente.

### Qué SÍ hacer

**Paso 4.1** — En `app/(app)/layout.tsx`:
- Importar `createClient` de `@/lib/supabase/server`.
- Después de obtener el `business` y antes de armar la navegación, agregar:

```typescript
const supabase = await createClient();
const { count: alertCount } = await supabase
  .from("stock_alerts")
  .select("id", { count: "exact", head: true })
  .eq("business_id", business.id)
  .eq("resolved", false);
```

- Pasar `alertCount` a `AppSidebar`:

```tsx
<AppSidebar items={navigation} alertCount={alertCount ?? 0} />
```

**Paso 4.2** — En `components/layout/app-sidebar.tsx`:
- Agregar `alertCount` a la interfaz `AppSidebarProps`:

```typescript
type AppSidebarProps = {
  items: NavigationItem[];
  alertCount?: number;
};
```

- Dentro del `.map` de `items`, para el ítem que tiene `item.module === "alerts"` o `item.href === "/alertas"`, agregar después del `<span>{item.label}</span>`:

```tsx
{item.module === "alerts" && alertCount && alertCount > 0 ? (
  <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
    {alertCount}
  </span>
) : null}
```

---

## 🟢 FASE 5 — AGREGAR STOCK RÁPIDO DESDE INVENTARIO (V4 Pro)

### Qué NO hacer
- No modificar `StockTable` más allá de agregar una columna.
- No modificar `createStockMovement` ni `createStockMovementAction`.
- No cambiar la página de inventario.

### Qué SÍ hacer

**Paso 5.1** — Crear archivo `components/inventario/agregar-stock-button.tsx`:

```tsx
"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { panelInputClass } from "@/components/ui/form-field-styles";
import { FormMessage } from "@/components/ui/form-message";
import { formatQuantity } from "@/lib/utils";

type Props = {
  productId: string;
  productName: string;
  currentStock: string;
};

type ActionState = { message?: string };

async function agregarStockAction(
  _prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState | undefined> {
  "use server";
  // Reutilizar lógica existente
  const { createStockMovement } = await import("@/modules/core/stock-movements/actions");
  const productId = formData.get("productId") as string;
  const quantity = Number(formData.get("quantity"));
  if (!productId || quantity <= 0) return { message: "Cantidad invalida." };

  const result = await createStockMovement({
    productId,
    type: "purchase",
    quantity,
    reason: "Carga rapida desde inventario",
  });

  if (!result.ok) return { message: result.message };

  const { revalidatePath } = await import("next/cache");
  revalidatePath("/inventario");
  return { message: `+${formatQuantity(quantity)} unidades agregadas.` };
}

export function AgregarStockButton({ productId, productName, currentStock }: Props) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(agregarStockAction, undefined);
  const [qty, setQty] = useState("");

  if (!open) {
    return (
      <Button
        type="button"
        variant="outline"
        size="xs"
        onClick={() => setOpen(true)}
      >
        + Agregar stock
      </Button>
    );
  }

  return (
    <div className="space-y-2 rounded border bg-muted/30 p-2">
      <p className="text-xs font-medium">{productName}</p>
      <p className="text-xs text-muted-foreground">
        Stock actual: {formatQuantity(currentStock)}
      </p>
      <form action={formAction} className="flex flex-col gap-2">
        <input type="hidden" name="productId" value={productId} />
        <input
          name="quantity"
          type="number"
          step="1"
          min="1"
          required
          placeholder="Cantidad"
          className={panelInputClass}
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          autoFocus
        />
        <div className="flex gap-1">
          <Button type="submit" disabled={pending} size="xs">
            {pending ? "..." : "+ Agregar"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={() => setOpen(false)}
          >
            Cancelar
          </Button>
        </div>
        <FormMessage message={state?.message} />
      </form>
    </div>
  );
}
```

**Paso 5.2** — En `components/inventario/stock-table.tsx`:
- Agregar una columna `<th>` de "Agregar stock" en el `<thead>`.
- En el `<tbody>`, agregar un `<td>` con `<AgregarStockButton ... />`.
- Importar `AgregarStockButton`.

El import y posición exacta:

```tsx
import { AgregarStockButton } from "@/components/inventario/agregar-stock-button";

// En thead, después de <th>Historial</th>:
<th className="px-3 py-2 font-medium">Agregar stock</th>

// En tbody, después del <td> que tiene el Link "Ver":
<td className="px-3 py-2">
  <AgregarStockButton
    productId={product.id}
    productName={product.name}
    currentStock={product.current_stock}
  />
</td>
```

---

## 🟢 FASE 6 — CREAR CATEGORÍA INLINE EN PRODUCTO (V4 Pro)

### Qué NO hacer
- No crear modal ni drawer.
- No cambiar el `ProductForm` ni su estructura.
- No cambiar la server action `createCategoryAction` más allá de agregar `createdId` y `createdName` al tipo de retorno.

### Qué SÍ hacer

**Paso 6.1** — En `modules/core/categories/actions.ts`, modificar el tipo `CategoryActionState`:

```typescript
export type CategoryActionState = {
  message?: string;
  errors?: Record<string, string[]>;
  createdId?: string;
  createdName?: string;
};
```

Y al final de `createCategoryAction`, después de crear el audit log, cambiar el return:

```typescript
// Antes:
return { message: "Categoria creada." };

// Después:
return { message: "Categoria creada.", createdId: row.id, createdName: parsed.data.name };
```

**Paso 6.2** — En `components/productos/product-basic-section.tsx`:

Este es un componente cliente (`"use client"`). Agregar en el select de categorías:

```tsx
// En el <select name="categoryId">, dentro del .map de categories, al final:
{categories.map((category) => (
  <option key={category.id} value={category.id}>
    {category.name}
  </option>
))}
<option value="__new__" className="font-medium text-primary">
  + Nueva categoria
</option>
```

Ahora manejamos el estado. Agregar al inicio del componente:

```tsx
import { createCategoryAction, type CategoryActionState } from "@/modules/core/categories/actions";
import { Button } from "@/components/ui/button";

// Estados dentro del componente:
const [showNewCategory, setShowNewCategory] = useState(false);
const [newCatName, setNewCatName] = useState("");
const [localCategories, setLocalCategories] = useState(categories);
const [catState, catFormAction, catPending] = useActionState(createCategoryAction, undefined);
```

Lógica cuando se cambia el select:

```tsx
const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  if (e.target.value === "__new__") {
    setShowNewCategory(true);
  }
  // No bloqueamos la selección normal
};
```

Renderizar debajo del select (o en `<div className="space-y-1 sm:col-span-2">` si el select está dentro de uno):

```tsx
{showNewCategory && (
  <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-3">
    <label className="text-sm font-medium text-foreground">
      Nombre de la nueva categoria
    </label>
    <div className="flex gap-2">
      <input
        className={panelInputClass}
        value={newCatName}
        onChange={(e) => setNewCatName(e.target.value)}
        placeholder="Ej: Frutas, Bebidas..."
        autoFocus
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={catPending || !newCatName.trim()}
        onClick={async () => {
          if (!newCatName.trim()) return;
          // Simular formData para la action
          const fd = new FormData();
          fd.set("name", newCatName.trim());
          const result = await createCategoryAction(undefined, fd);
          if (result?.createdId) {
            setLocalCategories(prev => [
              ...prev,
              { id: result.createdId!, name: result.createdName! }
            ]);
            setNewCatName("");
            setShowNewCategory(false);
          }
        }}
      >
        {catPending ? "..." : "Crear"}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => {
          setShowNewCategory(false);
          setNewCatName("");
        }}
      >
        Cancelar
      </Button>
    </div>
  </div>
)}
```

**IMPORTANTE**: El `select` debe usar `localCategories` en lugar de `categories` para que refleje la nueva categoría creada. Reemplazar `categories.map(...)` por `localCategories.map(...)`.

Pero **no cambiar la prop** `categories` — solo usar `localCategories` como copia local con estado.

---

## 📋 CHECKLIST POST-IMPLEMENTACIÓN

Después de implementar cada fase, verificar:

- [ ] `npm run build` pasa sin errores
- [ ] `npm run lint` no muestra errores nuevos
- [ ] La página de productos (/productos) carga y permite crear producto
- [ ] La página de inventario (/inventario) carga y muestra stock
- [ ] El registro de usuario (/auth/register) funciona y muestra toast si falla auto-login
- [ ] Las alertas (/alertas) cargan y el badge en sidebar refleja el conteo
- [ ] Los formatos de hora se ven como `14:32:08` en todas las tablas
- [ ] Al crear producto sin SKU ni barcode en almacén: muestra error de validación
- [ ] Al crear producto sin SKU ni barcode en verdulería: permite crear sin error
- [ ] Al seleccionar "+ Nueva categoría" en producto, se puede crear inline

---

## 🧠 RESUMEN PARA DEEPSEEK V4

```
Contexto del proyecto:
- Next.js 16 App Router
- Supabase (Auth + DB + RLS)
- React 19 con Server Actions
- Tailwind 4 CSS
- Sin ORM (SQL directo vía Supabase)
- Sin librería de toasts (se añade sonner)
- Sin wizard ni multi-step (se mantiene formulario plano)

Reglas:
1. NO modificar DB, migraciones, ni RLS policies
2. NO reescribir componentes enteros (solo añadir)
3. NO cambiar props, interfaces, o tipos exportados de componentes existentes
4. NO modificar server actions de productos, ventas, stock (solo categories)
5. NO refactorizar ni renombrar nada existente
6. Solo archivos listados en las fases de este documento
7. build debe pasar sin errores
8. No hay cambios de UI drásticos — el proyecto mantiene su apariencia actual
```

> Fin del documento.
