# arquitectura25.md — Paso de confirmación real y arreglo de alerta inactivo

## Análisis previo

### Estado actual del wizard en `ProductForm`

| Paso | Componente | Descripción |
|---|---|---|
| 1 — Datos básicos | `ProductBasicSection` | nombre, unidad, categoría, proveedor, SKU, barcode |
| 2 — Precio y stock | `ProductPricingSection` | costo, venta, stock actual, stock mínimo, tarjeta margen |
| 3 — Venta rápida | `ProductQuickSaleSection` | alta rotación, acceso rápido (switches) |
| 4 — Configuración | `ProductConfigSection` | colapsable, campos según rubro |
| (sin paso de confirmación real) | — | solo botones "Guardar" al final |

### Mensaje "No puedes mover stock de un producto inactivo"

- **Ubicación**: `modules/core/stock-movements/actions.ts`, línea 88.
- **Contexto**: Server action `createStockMovement`. Es una validación que retorna error si el producto seleccionado está inactivo.
- **Realidad**: El formulario `StockMovementForm` usa `getMovementFormData()` que filtra `.eq("active", true)` y `listInventoryProducts()` también filtra activos. Por lo tanto, es imposible que el usuario seleccione un producto inactivo desde la UI. Esta validación server-side es redundante como safety net, pero nunca debería saltar en uso normal.
- **Decisión**: El usuario pide borrarla. Se reemplaza por un comentario documentando que la UI ya filtra productos activos, y se elimina el bloque de validación.

### Referencias al campo `active`

- `modules/core/stock-movements/actions.ts` → `createStockMovement` (mensaje a eliminar)
- `modules/core/inventory/actions.ts` → `listInventoryProducts` usa `.eq("active", true)` (solo activos)
- `modules/core/stock-movements/actions.ts` → `getMovementFormData` usa `.eq("active", true)` (solo activos)
- `modules/core/products/actions.ts` → `findActiveProductByBarcode` usa `.eq("active", true)` (solo activos)
- `components/inventario/stock-movement-form.tsx` → nunca envía productos inactivos porque viene filtrado desde el servidor

---

## Plan de implementación

---

### FASE 0 — Eliminar alerta "No puedes mover stock de un producto inactivo"

**Archivo**: `modules/core/stock-movements/actions.ts`

**Qué hacer**: Eliminar las líneas 87-89:
```typescript
  if (!product.active) {
    return { ok: false as const, message: "No puedes mover stock de un producto inactivo." };
  }
```

**Razón**: El formulario de movimientos de stock ya filtra solo productos activos (`getMovementFormData` usa `.eq("active", true)`). Esta validación es innecesaria y el usuario reporta que no debe aparecer.

**Riesgo**: Mínimo. Si por algún caso extremo (API directa, manipulación) se intenta mover stock de un producto inactivo, la DB igual rechazará la operación porque `createStockMovement` actualiza el stock del producto. No hay riesgo de datos corruptos.

---

### FASE 1 — Componente `ProductConfirmSection` (paso 5 de confirmación real)

**Crear**: `components/productos/product-confirm-section.tsx`

**Props** (todas vienen del formulario padre vía refs o estado compartido):

```typescript
type ProductConfirmSectionProps = {
  businessType: BusinessType;
  // Datos básicos (se leen del DOM via form ref)
  name: string;
  categoryName: string;  // resuelto desde categories[]
  supplierName: string;  // resuelto desde suppliers[]
  sku: string;
  barcode: string;
  unitType: string;
  // Precio y stock
  costPrice: string;
  salePrice: string;
  currentStock: string;
  minStock: string;
  // Venta rápida
  fastRotation: boolean;
  pinned: boolean;
  // Configuración
  metadata: Record<string, unknown> | null;
  // Para resolver nombres
  categories: { id: string; name: string }[];
  suppliers: { id: string; name: string }[];
};
```

**Estructura visual**:

```
┌─────────────────────────────────────────┐
│ ✅ Revisión final                       │
│ Verifica los datos antes de crear       │
├─────────────────────────────────────────┤
│                                         │
│ ┌─ Producto ─────────────────────────┐  │
│ │ Nombre: Coca Cola 1.5L            │  │
│ │ Categoría: Bebidas                 │  │
│ │ Proveedor: Coca Cola               │  │
│ │ Código: 7801234567890              │  │
│ └────────────────────────────────────┘  │
│                                         │
│ ┌─ Precio y stock ───────────────────┐  │
│ │ Costo: $900                        │  │
│ │ Venta: $1.500                      │  │
│ │ Ganancia aprox: +$600              │  │
│ │ Margen aprox: 66%                  │  │
│ │ Stock inicial: 20                  │  │
│ │ Stock mínimo: 5                    │  │
│ └────────────────────────────────────┘  │
│                                         │
│ ┌─ Venta rápida ─────────────────────┐  │
│ │ Alta rotación: Sí                  │  │
│ │ Acceso rápido: Sí                  │  │
│ └────────────────────────────────────┘  │
│                                         │
│ ┌─ Configuración ────────────────────┐  │
│ │ (según rubro, solo si hay datos)   │  │
│ │ Venta por peso: Sí                │  │
│ │ Perecible: Sí                      │  │
│ │ Vida útil: 7 días                 │  │
│ └────────────────────────────────────┘  │
│                                         │
│ ┌─ Checklist ────────────────────────┐  │
│ │ ✓ Nombre del producto             │  │
│ │ ✓ Precio de venta                 │  │
│ │ ✓ Stock inicial                   │  │
│ │ ✓ Identificador (SKU o barcode)   │  │
│ │ ✓ Configuración revisada          │  │
│ └────────────────────────────────────┘  │
│                                         │
│ ┌─ Vista previa ─────────────────────┐  │
│ │ [Coca Cola 1.5L]                   │  │
│ │ $1.500                             │  │
│ │ Stock: 20                          │  │
│ └────────────────────────────────────┘  │
│                                         │
│ [← Anterior]   [Crear producto]         │
│                                         │
└─────────────────────────────────────────┘
```

**Checklist de validación**:

| Item | Condición | Estado |
|---|---|---|
| Nombre del producto | `name.length >= 2` | ✓ o ⚠ |
| Precio de venta | `Number(salePrice) > 0` | ✓ o ⚠ |
| Stock inicial | `Number(currentStock) > 0` | ✓ o ⚠ |
| Identificador | `sku || barcode` (excepto verdulería) | ✓ o ⚠ |
| Configuración revisada | Siempre ✓ (es solo visual) | ✓ |

Si algún item está en ⚠, el botón "Crear producto" se deshabilita.

---

### FASE 2 — Compartir estado entre secciones del formulario

**Archivo**: `components/productos/product-form.tsx`

**Problema**: Actualmente cada subsección maneja su propio estado interno. Para que el paso de confirmación pueda leer los valores actuales, necesitamos alguna forma de compartir estado.

**Solución elegida**: Usar `useRef` con un callback pattern + estado sincronizado.

En lugar de refactorizar completamente a estado controlado (lo cual rompería muchos inputs con `defaultValue`), se usa un enfoque híbrido:

1. Agregar un `formRef = useRef<HTMLFormElement>(null)` en `ProductForm`.
2. En el paso de confirmación, leer los valores actuales del formulario mediante `formRef.current` (FormData).
3. Para los switches (venta rápida), mantener estado sincronizado vía `onChange`.
4. Para la tarjeta de margen, el `ProductPricingSection` ya tiene estado interno (`costPrice`, `salePrice`) que se puede compartir hacia arriba.

**Alternativa**: Agregar `onChange` callbacks en cada subsección que actualicen un estado global en `ProductForm`. Esta es la opción más limpia.

**Plan concreto**:

- `ProductBasicSection`: agregar prop `onFieldChange?: (field: string, value: string) => void`.
- `ProductPricingSection`: ya tiene estado interno, exponer `onCostChange` y `onSaleChange` o simplemente usar el formRef.
- `ProductQuickSaleSection`: agregar `onChange?: (fastRotation: boolean, pinned: boolean) => void`.
- `ProductConfigSection`: no necesita estado porque solo se leen los valores de metadata desde los inputs del DOM.

**Enfoque simplificado**: Para no complicar el refactor, usar `formRef` para leer todos los valores al momento de mostrar el paso de confirmación. Cuando el usuario navega al paso 5, se captura una instantánea del formulario.

```typescript
const formRef = useRef<HTMLFormElement>(null);
const [confirmSnapshot, setConfirmSnapshot] = useState<FormData | null>(null);

// Al entrar al paso 5 (confirmar), tomar la foto
function goToStep(step: number) {
  if (step === maxSteps - 1 && formRef.current) {
    setConfirmSnapshot(new FormData(formRef.current));
  }
  setCurrentStep(step);
  topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
}
```

Luego se pasa `confirmSnapshot` a `ProductConfirmSection`.

---

### FASE 3 — Integrar paso 5 en el wizard

**Archivo**: `components/productos/product-form.tsx`

**Wizard steps final**:

```typescript
const wizardSteps: WizardStep[] = [
  { id: "basicos", label: "Datos básicos" },
  { id: "precio", label: "Precio y stock" },
  { id: "venta-rapida", label: "Venta rápida" },
  { id: "config", label: "Configuración" },
  { id: "confirmar", label: "Confirmar" },
];
```

**maxSteps** pasa de 4 a 5.

**Navegación**: En el paso 5, los botones "Siguiente" desaparecen y solo quedan "← Anterior", "Crear producto" (submit deshabilitado si checklist falla), y "Guardar y crear otro".

**Regla de negocio**: En modo rápido (quick mode), no hay paso de confirmación. El formulario envía directamente como hasta ahora. En modo edición, tampoco hay confirmación (no cambia el comportamiento actual).

---

### FASE 4 — Vista previa del producto

Dentro de `ProductConfirmSection`, agregar un bloque de vista previa:

```
┌──────────────────────┐
│ Vista previa         │
│                      │
│ [Nombre producto]    │
│ $Precio              │
│ Stock: X             │
│ Unidad: kg           │
└──────────────────────┘
```

- Para **verdulería**: mostrar nombre + precio + unidad (kg, g).
- Para **almacén**: mostrar nombre + precio + código.
- Para **ferretería**: mostrar nombre + precio + descripción técnica (marca, modelo, medida).

---

### FASE 5 — Verificación

- Build exitoso (`npx next build`).
- Confirmar que se crea producto correctamente desde el wizard con paso de confirmación.
- Confirmar que modo rápido sigue funcionando sin confirmación.
- Confirmar que edición de producto sigue funcionando sin confirmación.
- Confirmar que el mensaje "No puedes mover stock de un producto inactivo" ya no existe.
- Verificar que movimientos de stock siguen funcionando.

---

## Resumen de archivos

| Archivo | Acción |
|---|---|
| `components/productos/product-confirm-section.tsx` | CREAR — paso de confirmación real |
| `components/productos/product-form.tsx` | MODIFICAR — agregar paso 5, formRef, snapshot, integración de confirmación |
| `modules/core/stock-movements/actions.ts` | MODIFICAR — eliminar validación de producto inactivo |

## Lo que NO cambia

- Schema de validación (`productSchema`) — intacto.
- Server actions (`createProductAction`, `updateProductAction`, `createStockMovement`) — intactas (solo se elimina una validación redundante).
- Componentes de secciones existentes (`ProductBasicSection`, `ProductPricingSection`, `ProductQuickSaleSection`, `ProductConfigSection`) — no se modifican.
- Páginas (`nuevo/page.tsx`, `editar/page.tsx`) — intactas.
- Modo rápido y edición — intactos.
