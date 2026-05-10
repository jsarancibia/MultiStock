# 🛠 Edición rápida de productos desde el listado

## Diagnóstico

### Problema
El usuario quiere modificar proveedor, precio de venta, precio de costo (margen) y estado activo/inactivo de productos directamente desde la tabla de listado, sin tener que navegar a la página de detalle ni al formulario de edición.

### Estado actual

| Acción | ¿Dónde está disponible? |
|---|---|
| Cambiar proveedor | Solo en formulario de edición (`/productos/[id]/editar`) |
| Cambiar precio de venta | Solo en formulario de edición |
| Cambiar precio de costo | Solo en formulario de edición (el margen deriva de costo + venta) |
| Cambiar estado activo/inactivo | Solo desde detalle → "Desactivar" (una vía, sin reactivar) |

### ¿Qué NO hay que cambiar?
- El formulario completo de edición (`updateProductAction`, `ProductForm`, `editar/page.tsx`) sigue igual
- `deactivateProductAction` y `createProductAction` no se tocan
- La tabla actual (`ProductsTable`) es Server Component y debe seguir siéndolo parcialmente

---

## Fase 1 — Server actions de actualización parcial

### 1.1 — Schema de validación (`lib/validations/product.ts`)

Agregar al final del archivo (sin modificar nada existente):

```ts
export const quickProductUpdateSchema = z.object({
  supplierId: z.string().uuid().optional().or(z.literal("")),
  salePrice: z.coerce.number().min(0, "Precio inválido."),
  costPrice: z.coerce.number().min(0, "Costo inválido."),
  active: z.coerce.boolean().default(true),
});

export type QuickProductUpdateInput = z.infer<typeof quickProductUpdateSchema>;
```

### 1.2 — `quickUpdateProductAction` (`modules/core/products/actions.ts`)

Nueva server action al final del archivo (no modificar nada existente):

```ts
export async function quickUpdateProductAction(
  productId: string,
  _prevState: ProductActionState | undefined,
  formData: FormData
): Promise<ProductActionState | undefined>
```

**Comportamiento:**
- Recibe solo `supplierId`, `salePrice`, `costPrice`, `active`
- Valida con `quickProductUpdateSchema`
- Obtiene estado anterior para auditoría (`cost_price`, `sale_price`, `active`)
- Actualiza solo esos 4 campos en Supabase
- Crea audit log con acción `price_changed`, `toggled_active` o `updated`
- Retorna `{ message, success }` sin redirect (para que el formulario inline funcione con `useActionState`)

**No debe:**
- Validar ni modificar nombre, SKU, barcode, unit_type, min_stock, metadata, current_stock
- Hacer redirect (la tabla sigue visible)
- Romper la action existente `updateProductAction`

### 1.3 — `toggleProductActiveAction` (`modules/core/products/actions.ts`)

Nueva server action para toggle rápido sin redirect:

```ts
export async function toggleProductActiveAction(productId: string)
```

**Comportamiento:**
- Obtiene estado actual del producto
- Invierte `active`
- Actualiza en DB
- Crea audit log
- Retorna `{ success: true, active: newActive, message }` sin redirect

---

## Fase 2 — Componente de edición inline

### 2.1 — `InlineProductEditor` (`components/productos/inline-product-editor.tsx`)

Nuevo Client Component que se renderiza dentro de cada fila de la tabla cuando el usuario hace clic en "Editar".

**Props:**

```ts
type InlineProductEditorProps = {
  productId: string;
  /** Valores actuales para precargar */
  initialSupplierId: string | null;
  initialSalePrice: string;
  initialCostPrice: string;
  initialActive: boolean;
  /** Lista de proveedores para el <select> */
  suppliers: { id: string; name: string }[];
  /** Callback al guardar exitosamente */
  onSaved: () => void;
  /** Callback al cancelar */
  onCancel: () => void;
};
```

**UI:**
```
┌─────────────────────────────────────────────┐
│  Proveedor: [select ▼]                     │
│  Precio venta: [input number]              │
│  Precio costo: [input number]              │
│  Estado: [Activo / Inactivo] toggle       │
│                                             │
│  [Guardar] [Cancelar]                       │
└─────────────────────────────────────────────┘
```

**Comportamiento:**
- Usa `useActionState` con `quickUpdateProductAction`
- Muestra spinner en botón mientras guarda
- Al guardar exitosamente → llama `onSaved()` y el padre refresca
- Al cancelar → llama `onCancel()` y vuelve a vista de solo lectura
- Errores de validación se muestran inline (mensajes rojos debajo de inputs)
- No usa modal/dialog — se renderiza inline dentro de la fila

**Estilo:**
- Panel compacto con borde, padding reducido
- Inputs de tamaño sm
- Select de proveedor filtrable (si hay muchos)

### 2.2 — Integración en la tabla

Cada fila de producto puede estar en dos estados: **lectura** (default) o **edición** (inline).

Se agrega una columna "Acciones" al final con un botón "Editar" que, al hacer clic, reemplaza las columnas editables (Proveedor, Precio, Estado, Margen) por el editor inline.

**Lógica de toggle por fila:**
```ts
const [editingId, setEditingId] = useState<string | null>(null);
```

Solo una fila puede estar en edición a la vez.

---

## Fase 3 — Modificaciones a la tabla y página

### 3.1 — ProductsTable (`components/productos/products-table.tsx`)

**Convertir de Server Component a Client Component** (agregar `"use client"` al inicio).

**Cambios en props:**

```ts
type ProductsTableProps = {
  businessType: BusinessType;
  products: ProductRow[];
  suppliers: { id: string; name: string }[];
};
```

**Cambios en el JSX:**

1. Agregar columna `<th>Acciones</th>` al final del `<thead>`
2. En cada fila:
   - Si `editingId === product.id` → ocultar las celdas de proveedor, precio, margen y estado; en su lugar mostrar `<InlineProductEditor>` que ocupa esas columnas con `colSpan`
   - Si no → mostrar los valores actuales + botón "Editar"
3. El botón "Editar" setea `editingId`
4. El botón "Cancelar" en el editor limpia `editingId`
5. El callback `onSaved` refresca los datos de la página

**Refresco de datos tras guardar:**
- Opción A: `router.refresh()` — recarga Server Components manteniendo estado del cliente
- Opción B: estado local que actualiza el producto en la lista sin recargar

**Recomendación:** Usar `router.refresh()` por simplicidad. Luego de `onSaved`, llamar:
```ts
function handleSaved() {
  setEditingId(null);
  router.refresh();
}
```

### 3.2 — Página de productos (`app/(app)/productos/page.tsx`)

**Cambio mínimo:** pasar `suppliers` a `ProductsTable`:

```tsx
<ProductsTable
  businessType={business.business_type}
  products={products}
  suppliers={suppliers}
/>
```

Los `suppliers` ya se obtienen de `listSuppliers()` en la línea 25 del page actual. Solo falta pasarlos como prop.

---

## Resumen de archivos a crear/modificar

### Nuevos archivos

| Archivo | Propósito |
|---|---|
| `components/productos/inline-product-editor.tsx` | Formulario inline de edición rápida (Client Component) |

### Archivos a modificar

| Archivo | Cambio |
|---|---|
| `lib/validations/product.ts` | Agregar `quickProductUpdateSchema` y su tipo |
| `modules/core/products/actions.ts` | Agregar `quickUpdateProductAction` y `toggleProductActiveAction` al final |
| `components/productos/products-table.tsx` | Agregar columna Acciones, estado editingId, render condicional de InlineProductEditor. Agregar `"use client"`. Agregar prop `suppliers` |
| `app/(app)/productos/page.tsx` | Pasar `suppliers` a `ProductsTable` |

### Archivos NO modificados

| Archivo | Razón |
|---|---|
| `app/(app)/productos/[id]/editar/page.tsx` | No tocar — formulario completo sigue funcionando |
| `components/productos/product-form.tsx` | No tocar — wizard de producto intacto |
| Cualquier otro archivo | No tocar |

---

## Orden de implementación sugerido

```
Fase 1 — Server actions
├── 1.1 Schema quickProductUpdateSchema en lib/validations/product.ts
├── 1.2 quickUpdateProductAction al final de modules/core/products/actions.ts
├── 1.3 toggleProductActiveAction al final de modules/core/products/actions.ts
└── (Verificar build: npm run build)

Fase 2 — Componente inline
├── 2.1 InlineProductEditor en components/productos/inline-product-editor.tsx
└── (Lo probamos con un uso temporal antes de integrar)

Fase 3 — Integración en tabla y página
├── 3.1 ProductsTable: agregar "use client", columna Acciones, estado editingId
├── 3.2 page.tsx: pasar suppliers a ProductsTable
└── (Verificar build: npm run build)
```

---

## Notas técnicas

1. **`useActionState` + Server Action sin redirect**: La acción `quickUpdateProductAction` retorna `ProductActionState` igual que las existentes, pero sin `redirect()`. El formulario inline usa `useActionState` para obtener feedback.
2. **refresh vs revalidate**: `router.refresh()` funciona desde Client Components y recarga los Server Components sin perder estado del cliente. Es la opción correcta aquí.
3. **Sin nuevas dependencias**: Se usa solo React, Base UI (ya instalado), Lucide icons y las utilidades existentes.
4. **Sin modificar lógica existente**: Todas las acciones y componentes previos siguen funcionando igual. Solo se agregan nuevas exportaciones.
5. **Estado por fila**: Solo una fila puede editarse a la vez, manejado con un `useState<string | null>` en `ProductsTable`.
6. **Auditoría**: Ambas nuevas acciones generan audit logs con `createAuditLog` para mantener trazabilidad.
