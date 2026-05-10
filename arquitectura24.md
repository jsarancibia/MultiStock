# arquitectura24.md — Reestructuración del formulario de producto

## Análisis previo

### Estado actual del formulario

| Componente | Archivo | Estado |
|---|---|---|
| ProductForm (wizard principal) | `components/productos/product-form.tsx` | 4 pasos: básicos, precio, rubro, confirmar |
| ProductBasicSection | `components/productos/product-basic-section.tsx` | name, unitType, category, supplier, SKU, barcode |
| ProductPricingSection | `components/productos/product-pricing-section.tsx` | salePrice, currentStock, costPrice (solo advanced), minStock (solo advanced) |
| ProductBusinessFields | `components/productos/product-business-fields.tsx` | wrapper que delega a rubro |
| ProductRubroFields | `components/productos/product-rubro-fields.tsx` | dispatch por businessType |
| VerduleriaProductFields | `modules/verduleria/product-fields.tsx` | is_perishable, allows_weight_sale, waste_tracking, expiration_days, pinned (checkbox) |
| AlmacenProductFields | `modules/almacen/product-fields.tsx` | fast_rotation, suggested_margin, commercial_category, pinned (checkbox) |
| FerreteriaProductFields | `modules/ferreteria/product-fields.tsx` | brand, model, material, measure, technical_specs |

### Schema actual (`lib/validations/product.ts`)

- `productSchema` con superRefine para SKU/barcode obligatorio (excepto verdulería).
- `productFiltersSchema` para búsqueda.
- `quickProductUpdateSchema` para edición inline.

### Server actions (`modules/core/products/actions.ts`)

- `buildMetadataFromFormData`: construye metadata según businessType.
  - verduleria: is_perishable, expiration_days, allows_weight_sale, waste_tracking, pinned
  - almacen: fast_rotation, suggested_margin, commercial_category, pinned
  - ferreteria: brand, model, material, measure, technical_specs
- `createProductAction`: inserta producto.
- `updateProductAction`: actualiza producto.
- `listProducts` usa `isLowMargin` que lee `suggested_margin` de metadata (solo filtro en listado, no en formulario).

### Páginas

- `app/(app)/productos/nuevo/page.tsx`: crea producto, pasa `createProductAction`.
- `app/(app)/productos/[id]/editar/page.tsx`: edita producto, pasa `updateProductAction.bind(null, product.id)`.

### Reglas de negocio actuales (schema)

| Rubro | SKU | Barcode |
|---|---|---|
| almacén | obligatorio (al menos 1) | obligatorio (al menos 1) |
| ferretería | obligatorio (al menos 1) | obligatorio (al menos 1) |
| verdulería | opcional | opcional |

---

## Problemas detectados

1. **Margen no visible**: no hay tarjeta visual de ganancia/margen.
2. **Sección Precio y Stock es débil**: debería ser la más prominente.
3. **Campos obsoletos**: `suggested_margin` y `commercial_category` (almacén) no aportan valor hoy — el margen se calcula automáticamente.
4. **Checkboxes en vez de switches**: rubro y venta rápida usan `<input type="checkbox">` en vez de toggles modernos.
5. **Configuración dispersa**: campos de rubro visibles siempre (no colapsables).
6. **No hay sección "Venta Rápida" independiente**: fast_rotation y pinned están mezclados con otros campos.

---

## Plan de implementación

---

### FASE 1 — Nueva sección "Venta Rápida" (`ProductQuickSaleSection`)

**Archivos a crear:**
- `components/productos/product-quick-sale-section.tsx`

**Archivos a modificar:**
- `components/productos/product-form.tsx`: agregar sección 3.
- `components/productos/product-business-fields.tsx` / `product-rubro-fields.tsx`: remover `pinned` y `fast_rotation` de los componentes de rubro (se mueven a la nueva sección).
- `modules/almacen/product-fields.tsx`: remover `fast_rotation` y `pinned` (se mueven a venta rápida).
- `modules/verduleria/product-fields.tsx`: remover `pinned` (se mueve a venta rápida).
- `modules/core/products/actions.ts` en `buildMetadataFromFormData`: remover `pinned` de verduleria y almacen; remover `fast_rotation` de almacen; estos campos pasan a ser parte de la metadata general.

**Qué hace:**
- Nuevo componente con dos switches modernos (o estilizados como toggles):
  - **Alta rotación**: texto ayuda "Producto vendido frecuentemente"
  - **Acceso rápido en ventas**: texto ayuda "Mostrar producto rápidamente en pantalla de ventas"
- Se posiciona como paso 3 del wizard (antes era paso 4 "Confirmar").
- El antiguo paso "Confirmar" se elimina.

**Regla de compatibilidad:**
- `pinned` y `fast_rotation` siguen siendo valores de metadata (Json).
- En `buildMetadataFromFormData`, estos campos se leen del FormData pero ya no se escriben dentro del bloque específico de rubro.
- Se agrega lectura genérica en el metadata para estos dos campos (para todos los business types).

---

### FASE 2 — Tarjeta visual de margen + Reordenar sección Precio

**Archivos a modificar:**
- `components/productos/product-pricing-section.tsx`: reordenar y agregar tarjeta de margen.

**Qué hace:**
- Mover `costPrice` a la vista siempre visible (no solo en advanced mode).
- Cuando `costPrice > 0` y `salePrice > 0`, mostrar tarjeta visual (cálculo en vivo, solo UI):
  ```
  ┌──────────────────────┐
  │ Ganancia estimada    │
  │ +$500                │
  │                      │
  │ Margen estimado      │
  │ 50%                  │
  └──────────────────────┘
  ```
- Cálculo: `ganancia = salePrice - costPrice`; `margen = ((salePrice - costPrice) / costPrice) * 100`.
- NO guardar en DB, NO cambiar schema, NO cambiar actions.
- La tarjeta debe verse limpia, con un borde sutil y fondo acorde.

**Cómo implementar el cálculo en vivo:**
- Usar `useState` + `onChange` en los inputs de costPrice y salePrice.
- El formulario ya tiene `onChange={() => setIsDirty(true)}` en el `<form>`, pero el cálculo necesita escuchar inputs específicos.
- Se puede manejar con `onChange` en cada input y un estado local `costPrice`, `salePrice`.
- Opción más simple: usar `useRef` para leer valores, o `useState` con `onChange` handlers.

**Orden final de campos:**
1. Precio de compra (antes llamado costPrice, mapeado al mismo input name)
2. Precio de venta *
3. Tarjeta de margen (solo visual)
4. Stock actual *
5. Stock mínimo

---

### FASE 3 — Colapsable de Configuración

**Archivos a crear:**
- `components/productos/product-config-section.tsx`

**Archivos a modificar:**
- `components/productos/product-form.tsx`: cambiar paso 4 para usar el nuevo componente colapsable.
- `components/productos/product-business-fields.tsx` / `product-rubro-fields.tsx`: ya no se usan en el flujo normal (se reemplazan por `ProductConfigSection`).

**Qué hace:**
- Nueva sección colapsable (por defecto cerrada) que contiene todo lo específico del rubro.
- Título: "Configuración del producto"
- Subtítulo: "Campos avanzados según tu tipo de negocio"
- Al expandir, muestra el contenido de `ProductRubroFields` según businessType.
- **Verdulería**: Venta por peso, Perecible, Control de merma, Vida útil (días)
- **Almacén**: ultra simple (solo los campos que quedan después de mover fast_rotation y pinned)
- **Ferretería**: Marca, Modelo, Material, Medida, Especificaciones

**Implementación del colapsable:**
- Usar estado `isOpen` con `useState(false)`.
- Botón de toggle con chevron/icono y animación CSS simple.

---

### FASE 4 — Sanitizar metadata en actions

**Archivos a modificar:**
- `modules/core/products/actions.ts`

**Qué hace:**
- Remover `suggested_margin` y `commercial_category` de `buildMetadataFromFormData` (almacén).
- Mover `pinned` y `fast_rotation` a un bloque general en `buildMetadataFromFormData` (para todos los rubros).
- El resto de campos de rubro se mantienen igual.

**Código resultante para `buildMetadataFromFormData`:**

```typescript
function buildMetadataFromFormData(formData: FormData, businessType: BusinessType) {
  const common = {
    fast_rotation: formData.get("fast_rotation") === "on",
    pinned: formData.get("pinned") === "on",
  };

  if (businessType === "verduleria") {
    return {
      ...common,
      is_perishable: formData.get("is_perishable") === "on",
      expiration_days: Number(formData.get("expiration_days") || 0),
      allows_weight_sale: formData.get("allows_weight_sale") === "on",
      waste_tracking: formData.get("waste_tracking") === "on",
    };
  }
  if (businessType === "almacen") {
    return {
      ...common,
      // almacen actualmente no tiene campos extra después de remover suggested_margin y commercial_category
    };
  }
  return {
    ...common,
    brand: String(formData.get("brand") || ""),
    model: String(formData.get("model") || ""),
    material: String(formData.get("material") || ""),
    measure: String(formData.get("measure") || ""),
    technical_specs: String(formData.get("technical_specs") || ""),
  };
}
```

**Nota**: `commercial_category` y `suggested_margin` se eliminan solo del formulario — la lógica `isLowMargin` en `listProducts` sigue funcionando con datos existentes en productos que ya tienen esos campos en metadata.

---

### FASE 5 — Reordenar wizard y eliminar paso "Confirmar"

**Archivos a modificar:**
- `components/productos/product-form.tsx`

**Wizard steps final:**

```typescript
const wizardSteps: WizardStep[] = [
  { id: "basicos", label: "Datos básicos" },
  { id: "precio", label: "Precio y stock" },
  { id: "venta-rapida", label: "Venta rápida" },
  { id: "config", label: "Configuración" },
];
```

- Eliminar el paso "Confirmar" (antes paso 4).
- En modo rápido (quick mode), se usa una vista única con todos los campos esenciales visibles.
- En modo avanzado, se navega por los 4 pasos del wizard.

---

### FASE 6 — Switches modernos (opcional, mejora visual)

Si el proyecto no tiene un componente Switch de Base UI, se implementa un switch CSS puro:

```tsx
// components/ui/toggle-switch.tsx
type ToggleSwitchProps = {
  name: string;
  label: string;
  helpText?: string;
  defaultChecked?: boolean;
};

export function ToggleSwitch({ name, label, helpText, defaultChecked = false }: ToggleSwitchProps) {
  return (
    <label className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
      <div>
        <span className="text-sm font-medium text-foreground">{label}</span>
        {helpText ? <p className="text-xs text-muted-foreground">{helpText}</p> : null}
      </div>
      <div className="relative">
        <input type="checkbox" name={name} defaultChecked={defaultChecked} className="peer sr-only" />
        <div className="h-6 w-11 rounded-full bg-muted-foreground/30 transition-colors peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-ring" />
        <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
      </div>
    </label>
  );
}
```

---

### FASE 7 — Verificación y limpieza

- Verificar que `createProductAction` y `updateProductAction` sigan funcionando con los nuevos nombres de campos.
- Verificar que `listProducts` y el filtro `low_margin` sigan funcionando (usa `suggested_margin` desde metadata existente).
- Verificar build exitoso (`npx next build`).
- Verificar edición de producto existente no se rompe.
- Verificar modo rápido (quick mode) funciona correctamente.

---

## Resumen de archivos

| Archivo | Acción |
|---|---|
| `components/productos/product-form.tsx` | MODIFICAR — reordenar wizard, agregar secciones 3 y 4, eliminar paso confirmar |
| `components/productos/product-pricing-section.tsx` | MODIFICAR — agregar tarjeta visual de margen, mover costPrice a siempre visible |
| `components/productos/product-basic-section.tsx` | MODIFICAR — reordenar campos, ocultar category y supplier (sin cambios mayores) |
| `components/productos/product-quick-sale-section.tsx` | CREAR — sección venta rápida con switches |
| `components/productos/product-config-section.tsx` | CREAR — sección colapsable de configuración por rubro |
| `components/ui/toggle-switch.tsx` | CREAR — switch moderno para formulario |
| `modules/almacen/product-fields.tsx` | MODIFICAR — remover fast_rotation, suggested_margin, commercial_category, pinned |
| `modules/verduleria/product-fields.tsx` | MODIFICAR — remover pinned |
| `modules/core/products/actions.ts` | MODIFICAR — sanitizar buildMetadataFromFormData, remover suggested_margin y commercial_category |
| `components/productos/product-business-fields.tsx` | MODIFICAR o ELIMINAR — posiblemente ya no necesario (reemplazado por ConfigSection) |
| `components/productos/product-rubro-fields.tsx` | MODIFICAR — solo dispatch, sin cambios de interfaz |

## Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Romper el filtro `low_margin` en listado | NO se toca `listProducts`, solo se remueve del formulario. Los productos existentes con `suggested_margin` en metadata siguen funcionando. |
| Romper edición de producto existente | El campo `suggested_margin` de productos existentes se mantiene en DB, solo no se muestra en el formulario. `updateProductAction` no falla si el campo no viene. |
| Romper modo rápido | Se mantiene el mismo flujo: todos los campos esenciales visibles. El modo rápido muestra las secciones 1 y 2 completas. |
| Switches no envían "off" en FormData | Usar hidden input con valor "off" antes del switch. |
