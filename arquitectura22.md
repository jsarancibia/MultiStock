# 🧭 Navegación entre pasos (Wizard + Botones Volver/Cancelar)

## Diagnóstico

### Problema
Los formularios de creación/edición no tienen forma de retroceder o cancelar sin usar el navegador o el sidebar. El usuario queda "atrapado" en la página.

### Estado actual
| Pantalla | ¿Tiene `← Volver`? | ¿Tiene `Cancelar`? | ¿Es multi-step? |
|---|---|---|---|
| `/productos/nuevo` | ❌ | ❌ | ❌ (todo visible) |
| `/productos/[id]/editar` | ❌ | ❌ | ❌ |
| `/proveedores/nuevo` | ❌ | ❌ | ❌ |
| `/proveedores/[id]/editar` | ❌ | ❌ | ❌ |
| `/inventario/movimientos/nuevo` | ❌ | ❌ | ❌ |
| `/ventas/nueva` | ❌ | ❌ | ❌ |

### Componentes faltantes
1. **ConfirmDialog** — Modal de confirmación para "¿Deseas cancelar? Se perderán los cambios no guardados."
2. **PageNavigation** — Barra con botones `← Volver` y `Cancelar` reutilizable.
3. **Wizard / Stepper** — Componente de pasos para el formulario de producto.
4. **onbeforeunload** — Protección contra cierre accidental con datos sin guardar.

---

## Fase 1 — Componentes base compartidos

### 1.1 — `ConfirmDialog`
**Archivo:** `components/ui/confirm-dialog.tsx`

```
┌─────────────────────────────────┐
│  ⚠  Descartar cambios          │
│                                 │
│  ¿Deseas cancelar? Se perderán  │
│  los cambios no guardados.      │
│                                 │
│  [Seguir editando] [Cancelar]   │
└─────────────────────────────────┘
```

**Propuesta de API:**

```tsx
type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  variant?: "default" | "destructive";
};
```

**Detalles técnicos:**
- Debe usar `@base-ui/react/dialog` (ya disponible en el proyecto como patrón).
- Debe ser accesible (aria, foco, teclado).
- Por defecto: título "Descartar cambios", descripción "¿Deseas cancelar? Se perderán los cambios no guardados.", botón "Cancelar" (rojo/destructive) y "Seguir editando" (outline).
- Props `variant="destructive"` para acciones irreversibles (rojo el botón de confirmar).

**No debe ser un componente de servidor** → `"use client"`.

---

### 1.2 — `BackButton`
**Archivo:** `components/ui/back-button.tsx`

Botón simple con icono de flecha izquierda y texto "Volver".

**Propuesta de API:**

```tsx
type BackButtonProps = {
  href: string;        // Ruta a la que vuelve (ej. "/productos")
  label?: string;      // Por defecto "Volver"
};
```

**Comportamiento:**
- Renderiza `<Link>` de Next.js con variant="ghost" y icono `ArrowLeft`.
- Posicionamiento: arriba a la izquierda del formulario, antes del título.
- Estilo: ghost, tamaño sm, sin bordes llamativos.

---

### 1.3 — `PageNavigation`
**Archivo:** `components/ui/page-navigation.tsx`

Barra inferior o superior con los dos botones juntos.

```
← Volver                          [Cancelar]
```

**Propuesta de API:**

```tsx
type PageNavigationProps = {
  backHref: string;           // Ruta de "Volver"
  backLabel?: string;         // Por defecto "Volver"
  onCancel?: () => void;       // Callback para abrir confirmación
  cancelLabel?: string;       // Por defecto "Cancelar"
  showCancel?: boolean;       // Por defecto true
};
```

**Comportamiento:**
- `onCancel` → abre un `ConfirmDialog` interno.
- Si se confirma → navega a `backHref` (o a una URL opcional `cancelHref`).
- Si no hay cambios pendientes → navega directamente sin confirmación.
- **Futuro:** detectar si el formulario tiene dirty fields mediante un contexto.

---

### 1.4 — `WizardStepper`
**Archivo:** `components/ui/wizard-stepper.tsx`

Indicador visual de pasos para el formulario de producto.

```
○ ── ○ ── ○ ── ●
1    2    3    4
Datos  Precio  Rubro  Confirmar
básicos y stock
```

**Propuesta de API:**

```tsx
type Step = {
  id: string;
  label: string;
  description?: string;
};

type WizardStepperProps = {
  steps: Step[];
  currentStep: number;   // índice 0-based
  onStepClick?: (stepIndex: number) => void;
};
```

**Detalles:**
- Paso activo: color primario, círculo relleno.
- Paso completado: check verde, clickeable.
- Paso futuro: gris, no clickeable o disabled.
- Responsive: en mobile solo mostrar el paso actual + contador "Paso 2 de 4".

**Tecnología:**
- Sin librería externa. CSS puro con Tailwind.
- `"use client"` por el estado interactivo.

---

### 1.5 — `useConfirmExit` hook
**Archivo:** `lib/hooks/use-confirm-exit.ts`

Hook que:
1. Previene navegación accidental con `beforeunload` del navegador (si hay datos sin guardar).
2. Retorna funciones `withConfirm(fn)` que envuelven callbacks de navegación con confirmación opcional.

```ts
function useConfirmExit(isDirty: boolean) {
  const confirmAndNavigate = (callback: () => void) => {
    if (isDirty) {
      // abrir ConfirmDialog
    } else {
      callback();
    }
  };
  return { confirmAndNavigate };
}
```

---

## Fase 2 — Integrar Volver/Cancelar en formularios simples

### 2.1 — SupplierForm (`components/forms/supplier-form.tsx`)

**Antes:**
```tsx
<form>...</form>
```

**Después:**
```tsx
<>
  <BackButton href="/proveedores" />
  <form>...</form>
  <PageNavigation backHref="/proveedores" onCancel={...} />
</>
```

**Rutas afectadas:**
- `/proveedores/nuevo`
- `/proveedores/[id]/editar`

### 2.2 — StockMovementForm (`components/inventario/stock-movement-form.tsx`)

**Antes:**
```tsx
<form>...</form>
```

**Después:**
```tsx
<>
  <BackButton href="/inventario/movimientos" />
  <form>...</form>
  <PageNavigation backHref="/inventario/movimientos" onCancel={...} />
</>
```

**Rutas afectadas:**
- `/inventario/movimientos/nuevo`

### 2.3 — SaleForm (`components/ventas/sale-form.tsx`)

**Antes:**
```tsx
<SaleForm>
```

**Después:**
```tsx
<>
  <BackButton href="/ventas" />
  <SaleForm>...</SaleForm>
  <PageNavigation backHref="/ventas" onCancel={...} />
</>
```

**Rutas afectadas:**
- `/ventas/nueva`

### 2.4 — Páginas de edición (productos y proveedores)

Para las páginas de edición, el botón `← Volver` debe apuntar a la página de detalle y no al listado:

| Página | `backHref` |
|---|---|
| `/productos/[id]/editar` | `/productos/[id]` |
| `/proveedores/[id]/editar` | `/proveedores` |

---

## Fase 3 — Wizard de producto (multi-step real)

### 3.1 — Arquitectura del wizard

El formulario de producto **actualmente** es una sola página con secciones numeradas visible todo a la vez. La Fase 3 lo convierte en un wizard paso a paso real.

**Estado futuro:**

```
[← Volver a productos]          [Cancelar]

○───○───○───○
1   2   3   4
Datos   Precio   Rubro   Confirmar
básicos  y stock

┌──────────────────────┐
│                      │
│   (Solo el paso      │
│    actual visible)   │
│                      │
└──────────────────────┘

[Anterior]          [Siguiente →]
                     (o [Crear producto] en el paso 4)
```

### 3.2 — Componente `ProductWizard` (nuevo)

**Archivo:** `components/productos/product-wizard.tsx`

**Propuesta de API:**

```tsx
type ProductWizardProps = {
  businessType: BusinessType;
  categories: Option[];
  suppliers: Option[];
  action: ServerAction;
  submitLabel: string;
  initialProduct?: ProductLike | null;
  allowInitialStockEdit?: boolean;
  allowMobileBarcodeLink?: boolean;
};
```

**Estado interno:**

```ts
const [currentStep, setCurrentStep] = useState(0);
const [formData, setFormData] = useState<Record<string, unknown>>({});
const [errors, setErrors] = useState<Record<string, string>>({});
```

**Pasos (0-indexed):**
| Índice | Sección | Componente |
|---|---|---|
| 0 | Datos básicos | `ProductBasicSection` |
| 1 | Precio y stock | `ProductPricingSection` |
| 2 | Datos del rubro | `ProductBusinessFields` (si `showAdvanced`) |
| 3 | Confirmar | Resumen + checkbox activo |

**Validación por paso:**
- Paso 0: nombre obligatorio, SKU/barcode si se ingresaron
- Paso 1: precio venta > 0, stock >= 0
- Paso 2: validación de campos de rubro (si aplica)
- Paso 3: solo submit

**Flujo:**
1. Usuario llena paso 0 → "Siguiente"
2. Validación cliente (Zod schema parcial) → si falla, muestra errores in-situ
3. Avanza al paso 1, datos preservados en estado
4. ... hasta paso 3 → botón cambia a "Crear producto" / "Guardar cambios"
5. Submit final con `useActionState` (como ahora)

**Botones:**
- "Anterior": `type="button"`, mueve al paso anterior (sin perder datos)
- "Siguiente": `type="button"`, valida paso actual y avanza
- "Crear producto" / "Guardar cambios": `type="submit"` (solo en paso final)
- "Cancelar": abre `ConfirmDialog`

### 3.3 — Anatomía visual del wizard

```
┌─────────────────────────────────────────┐
│  ← Volver a productos          Cancelar │ ← PageNavigation
├─────────────────────────────────────────┤
│     ○───○───○───○                       │ ← WizardStepper
│     1   2   3   4                        │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐    │
│  │                                 │    │
│  │   (Contenido del paso actual)   │    │ ← Sección activa
│  │                                 │    │
│  └─────────────────────────────────┘    │
│                                         │
├─────────────────────────────────────────┤
│  [Anterior]              [Siguiente →]  │ ← Botones de navegación
│                           o             │
│                          [Crear]        │
└─────────────────────────────────────────┘
```

### 3.4 — Detalles técnicos

**Nuevo archivo:** `components/productos/product-wizard.tsx`
**Archivos modificados:** 
- `components/productos/product-form.tsx` → se convierte en wrapper que renderiza `ProductWizard`
- `app/(app)/productos/nuevo/page.tsx` → posiblemente sin cambios (sigue renderizando `ProductForm`)
- `app/(app)/productos/[id]/editar/page.tsx` → igual

**Preservación de datos entre pasos:**
- Se usa un estado `Record<string, unknown>` que acumula valores de todos los pasos.
- Al hacer "Anterior", los datos del paso actual se guardan en ese estado antes de cambiar.
- Al llegar al paso final, se escriben como hidden inputs en el form para que `useActionState` los procese.

**Alternativa:** Usar un `React Context` (`FormDataContext`) compartido entre los pasos. Esto permite que cada sección lea/escriba del contexto sin prop drilling. Evaluar si es necesario (probablemente no, el estado local basta).

### 3.5 — Quick Mode vs Wizard

El modo "Rápido" (quick mode) actual es un toggle que muestra solo nombre, precio y stock para carga veloz.

**Decisión:** En modo rápido NO se activa el wizard. Se mantiene como formulario de una sola página con `PageNavigation`. El wizard solo se activa cuando el usuario desmarca "Rápido" (modo completo). Esto evita una fricción innecesaria para cargas rápidas.

```
quickMode = true  →  formulario simple (una página) con PageNavigation
quickMode = false →  formulario wizard multi-step
```

---

## Fase 4 — Protección contra cierre accidental

### 4.1 — `beforeunload` listener

Agregar un hook `useBeforeUnload(isDirty: boolean)` que registre/limpie el evento `beforeunload` del navegador:

```ts
useEffect(() => {
  if (isDirty) {
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }
}, [isDirty]);
```

**Archivo:** `lib/hooks/use-before-unload.ts`

### 4.2 — Integración en formularios

Cada formulario necesita un estado `isDirty` que sea `true` cuando el usuario ha modificado algún campo.

**Para formularios simples (supplier, stock movement, sale):** Detectar cambios contra valores iniciales mediante un `useEffect` o comparando con `defaultValues`.

**Para el wizard:** El estado `formData` es dirty si tiene al menos un campo con valor no vacío.

**Simplificación inicial:** Podemos asumir `isDirty = true` siempre que el formulario esté montado (conservador pero seguro). Mejorar después con detección precisa.

---

## Resumen de archivos a crear/modificar

### Nuevos archivos

| Archivo | Propósito |
|---|---|
| `components/ui/confirm-dialog.tsx` | Modal de confirmación reutilizable |
| `components/ui/back-button.tsx` | Botón "← Volver" con Link |
| `components/ui/page-navigation.tsx` | Barra con Volver + Cancelar |
| `components/ui/wizard-stepper.tsx` | Indicador visual de pasos |
| `lib/hooks/use-confirm-exit.ts` | Hook para confirmar antes de salir |
| `lib/hooks/use-before-unload.ts` | Hook para beforeunload |
| `components/productos/product-wizard.tsx` | Wizard multi-step de producto |

### Archivos a modificar

| Archivo | Cambio |
|---|---|
| `components/forms/supplier-form.tsx` | Agregar `BackButton` + `PageNavigation` |
| `components/inventario/stock-movement-form.tsx` | Agregar `BackButton` + `PageNavigation` |
| `components/ventas/sale-form.tsx` | Agregar `BackButton` + `PageNavigation` |
| `components/productos/product-form.tsx` | Refactor: modo rápido con navegación, modo completo con wizard |
| `app/(app)/productos/nuevo/page.tsx` | Posiblemente sin cambios |
| `app/(app)/productos/[id]/editar/page.tsx` | Posiblemente sin cambios |
| `app/(app)/proveedores/nuevo/page.tsx` | Posiblemente sin cambios |
| `app/(app)/proveedores/[id]/editar/page.tsx` | Posiblemente sin cambios |
| `app/(app)/inventario/movimientos/nuevo/page.tsx` | Posiblemente sin cambios |
| `app/(app)/ventas/nueva/page.tsx` | Posiblemente sin cambios |

---

## Orden de implementación sugerido

```
Fase 1 — Componentes base
├── 1.1 confirm-dialog.tsx
├── 1.2 back-button.tsx
├── 1.3 page-navigation.tsx
├── 1.4 use-confirm-exit.ts
├── 1.5 use-before-unload.ts
└── (Prueba: importar en una página de prueba)

Fase 2 — Formularios simples
├── 2.1 SupplierForm (proveedores)
├── 2.2 StockMovementForm (inventario)
├── 2.3 SaleForm (ventas)
└── (Verificar: cada formulario tiene Volver + Cancelar)

Fase 3 — Wizard de producto
├── 3.1 wizard-stepper.tsx
├── 3.2 product-wizard.tsx (refactor desde product-form.tsx)
├── 3.3 Integrar en product-form.tsx
└── (Verificar: navegación entre pasos, datos preservados)

Fase 4 — Protección cierre accidental
├── 4.1 Integrar use-before-unload en formularios
└── (Verificar: beforeunload se dispara con datos sucios)
```

---

## Notas técnicas

1. **React 19**: `useActionState` ya está disponible (es el que se usa actualmente). No cambiar.
2. **Base UI**: El `Dialog` de Base UI debe usarse para `ConfirmDialog` en lugar de implementar un modal desde cero. Verificar disponibilidad en `node_modules/@base-ui/react`.
3. **Tailwind v4**: Usar sintaxis Tailwind v4 (ya establecida en el proyecto).
4. **Server Components**: Los componentes de navegación (`BackButton`, `PageNavigation`, `ConfirmDialog`, `WizardStepper`) deben ser `"use client"`. Las páginas pueden seguir siendo Server Components que los importan.
5. **Sin nuevas dependencias**: Todo se implementa con librerías ya disponibles (React, Base UI, Tailwind, Lucide icons para las flechas).
6. **i18n**: Los textos están en español (como el resto de la app). No hay internacionalización por ahora.
