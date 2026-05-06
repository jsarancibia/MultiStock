# Arquitectura 18 - Experiencia de venta adaptada por tipo de negocio

Este documento define la implementación completa de la UI de ventas diferenciada por rubro en MultiStock.

Objetivo concreto:

- Verdulería → botones grandes de productos frecuentes, entrada por peso, sin barcode obligatorio.
- Almacén → buscador por código de barras primero, productos unitarios, flujo rápido.
- Ferretería → mezcla: buscador técnico (SKU, marca, medida) con scanner disponible.

## Punto de partida

Lo que ya existe y NO hay que modificar:

- `SaleForm`, `SaleItemsTable`, `SaleSummary`: funcionan correctamente para los tres rubros.
- `ProductSearch`: ya diferencia placeholder, scoring de búsqueda y detalle de ferretería.
- `SaleCartItem`, `SaleFormProduct`, `SaleActionState`: tipos estables.
- `getSaleFormData()`: ya ordena productos de almacén por rotación.
- `DECIMAL_UNITS` y `quantityInputAttrs`: ya manejan decimales según `unit_type`.
- Validación de backend: ya funciona para todos los rubros.

La estrategia es agregar capas encima, no reescribir.

---

## Fase 1 — Configuración central de ventas por rubro

Crear `lib/business/sale-config.ts`.

Este archivo es la única fuente de verdad para el comportamiento de la UI de ventas por rubro. Los componentes leen desde aquí en vez de hacer `if (businessType === "verduleria")` dispersos.

```ts
import type { BusinessType } from "@/config/business-types";

export type SaleConfig = {
  /**
   * Mostrar botones de acceso rápido con productos fijados.
   * Solo útil en rubros donde se venden los mismos productos muchas veces por día.
   */
  showQuickButtons: boolean;
  /**
   * Placeholder del buscador de productos en la pantalla de venta.
   */
  searchPlaceholder: string;
  /**
   * Si es true, el input de búsqueda tiene autoFocus y el flujo empieza por código.
   * Si es false, el flujo empieza por los botones rápidos.
   */
  searchAutoFocus: boolean;
  /**
   * Texto de ayuda sobre cómo ingresar cantidades.
   * null → no mostrar ayuda extra.
   */
  quantityHint: string | null;
  /**
   * Step por defecto al agregar un producto por peso (kg, g).
   * En verdulería conviene 0.5 para que el primer clic ya sea media unidad.
   * En el resto, el step lo controla solo el unit_type del producto.
   */
  weightStep: number;
};

const saleConfigByType: Record<BusinessType, SaleConfig> = {
  verduleria: {
    showQuickButtons: true,
    searchPlaceholder: "Buscar por nombre (banana, tomate...)",
    searchAutoFocus: false,
    quantityHint: "Kg y litros aceptan decimales. Ej: 0,850 kg de uva.",
    weightStep: 0.5,
  },
  almacen: {
    showQuickButtons: false,
    searchPlaceholder: "Código de barras, SKU o nombre del producto",
    searchAutoFocus: true,
    quantityHint: null,
    weightStep: 1,
  },
  ferreteria: {
    showQuickButtons: false,
    searchPlaceholder: "SKU, marca, medida o nombre del artículo",
    searchAutoFocus: true,
    quantityHint: null,
    weightStep: 1,
  },
};

export function getSaleConfig(type: BusinessType): SaleConfig {
  return saleConfigByType[type];
}
```

**Checklist Fase 1:**
- [ ] Crear `lib/business/sale-config.ts` con el contenido de arriba.

---

## Fase 2 — Campo "acceso rápido" en productos de verdulería

Los botones rápidos necesitan que el usuario pueda marcar sus productos más frecuentes. Se usa `metadata.pinned` (boolean) en el jsonb existente. No requiere migración.

### 2a — Agregar checkbox en el formulario de producto de verdulería

En `modules/verduleria/product-fields.tsx`, agregar al final del grid:

```tsx
<div className="space-y-1 sm:col-span-2">
  <label className="flex items-center gap-2 text-sm text-foreground">
    <input
      type="checkbox"
      name="pinned"
      defaultChecked={checkedOf(metadata, "pinned")}
    />
    Acceso rápido en ventas
  </label>
  <p className="text-xs text-muted-foreground pl-6">
    Aparece como botón directo en la pantalla de venta. Ideal para tus productos más vendidos.
  </p>
</div>
```

### 2b — Incluir `pinned` en la metadata al guardar

En `modules/core/products/actions.ts`, la función `buildMetadataFromFormData` ya tiene el bloque de verdulería. Agregar `pinned` al objeto:

```ts
if (businessType === "verduleria") {
  return {
    is_perishable: formData.get("is_perishable") === "on",
    expiration_days: Number(formData.get("expiration_days") || 0),
    allows_weight_sale: formData.get("allows_weight_sale") === "on",
    waste_tracking: formData.get("waste_tracking") === "on",
    pinned: formData.get("pinned") === "on",  // ← agregar esta línea
  };
}
```

### 2c — Exponer `pinned` en el tipo `SaleFormProduct`

En `lib/products/map-product-for-sale.ts`:

```ts
export type SaleFormProduct = {
  id: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  unit_type: string;
  current_stock: string;
  sale_price: string;
  brand: string | null;
  model: string | null;
  measure: string | null;
  pinned: boolean;   // ← agregar
};

export function mapProductForSale(row: ProductFromDb): SaleFormProduct {
  const meta = (row.metadata ?? {}) as Record<string, unknown>;
  return {
    id: row.id,
    name: row.name,
    sku: row.sku,
    barcode: row.barcode,
    unit_type: row.unit_type,
    current_stock: row.current_stock,
    sale_price: row.sale_price,
    brand: strMeta(meta.brand),
    model: strMeta(meta.model),
    measure: strMeta(meta.measure),
    pinned: meta.pinned === true,   // ← agregar
  };
}
```

**Checklist Fase 2:**
- [ ] Agregar checkbox `pinned` en `modules/verduleria/product-fields.tsx`.
- [ ] Agregar `pinned` al objeto de retorno en `buildMetadataFromFormData` (bloque verdulería).
- [ ] Agregar `pinned: boolean` en `SaleFormProduct` y su mapeo en `mapProductForSale`.

---

## Fase 3 — Componente de botones rápidos

Crear `components/ventas/quick-product-buttons.tsx`.

Este componente muestra una grilla de botones grandes para los productos fijados. Un toque agrega el producto al carrito. Reutiliza la misma función `onAdd` que el buscador.

```tsx
"use client";

import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import type { SaleProductOption } from "@/components/ventas/product-search";

type QuickProductButtonsProps = {
  products: SaleProductOption[];
  onAdd: (product: SaleProductOption) => void;
};

export function QuickProductButtons({ products, onAdd }: QuickProductButtonsProps) {
  if (!products.length) return null;

  return (
    <div className="space-y-3 rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="font-medium text-foreground">Acceso rápido</h2>
        <p className="text-xs text-muted-foreground">Toca para agregar</p>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {products.map((product) => (
          <button
            key={product.id}
            type="button"
            onClick={() => onAdd(product)}
            className={cn(
              "flex flex-col items-start gap-1 rounded-xl border border-border bg-background px-3 py-3 text-left shadow-sm transition-all",
              "hover:border-amber-400 hover:bg-amber-50/60 hover:shadow active:scale-[0.97]",
              "dark:hover:border-amber-400/70 dark:hover:bg-amber-950/20"
            )}
          >
            <span className="line-clamp-2 text-sm font-medium leading-tight text-foreground">
              {product.name}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatCurrency(product.sale_price)}
            </span>
            <span className="text-[10px] text-muted-foreground/70">
              Stock: {product.current_stock} {product.unit_type}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
```

Notas de diseño:
- Usa `amber-400` para el hover → coherente con el color amber del sidebar activo del proyecto.
- `line-clamp-2` para nombres largos como "Tomate cherry 250g".
- Muestra precio y stock para que el cajero tenga contexto inmediato.
- `active:scale-[0.97]` da feedback táctil en móvil.

**Checklist Fase 3:**
- [ ] Crear `components/ventas/quick-product-buttons.tsx`.
- [ ] Verificar que el tipo `SaleProductOption` ya tiene `sale_price` y `current_stock` (sí los tiene).

---

## Fase 4 — Modificar `SaleForm` para recibir config y botones rápidos

`SaleForm` debe recibir `saleConfig` y `pinnedProducts` y pasarlos al lugar correcto.

### 4a — Cambios en el tipo `SaleFormProps`

```ts
import { getSaleConfig, type SaleConfig } from "@/lib/business/sale-config";
import { QuickProductButtons } from "@/components/ventas/quick-product-buttons";

type SaleFormProps = {
  businessType: BusinessType;
  products: SaleProductOption[];
  pinnedProducts?: SaleProductOption[];   // ← nuevo
  saleConfig: SaleConfig;                 // ← nuevo
  allowMobileBarcodeLink?: boolean;
  action: (
    prevState: SaleActionState | undefined,
    formData: FormData
  ) => Promise<SaleActionState | undefined>;
};
```

### 4b — Cambios en la función `addProduct` dentro de `SaleForm`

La lógica del step ya existe parcialmente. Actualizarla para usar `saleConfig.weightStep`:

```ts
function addProduct(product: SaleProductOption) {
  setClientError(null);
  setItems((prev) => {
    const existing = prev.find((item) => item.productId === product.id);
    if (existing) {
      const isWeightUnit = product.unit_type === "kg" || product.unit_type === "g";
      const step = isWeightUnit ? saleConfig.weightStep : 1;
      return prev.map((item) =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + step }
          : item
      );
    }
    return [
      ...prev,
      {
        productId: product.id,
        name: product.name,
        unitType: product.unit_type,
        stock: Number(product.current_stock),
        quantity: 1,
        unitPrice: Number(product.sale_price),
      },
    ];
  });
}
```

### 4c — Layout del formulario según rubro

En el JSX de `SaleForm`, insertar `QuickProductButtons` si hay productos fijados:

```tsx
<div className="grid gap-4 lg:grid-cols-3">
  <div className="space-y-4 lg:col-span-2">
    {/* Botones rápidos: solo si el rubro lo habilita y hay productos fijados */}
    {saleConfig.showQuickButtons && pinnedProducts && pinnedProducts.length > 0 ? (
      <QuickProductButtons
        products={pinnedProducts}
        onAdd={addProduct}
      />
    ) : null}

    <ProductSearch
      businessType={businessType}
      products={products}
      onAddProduct={addProduct}
      allowMobileBarcodeLink={allowMobileBarcodeLink}
      searchPlaceholder={saleConfig.searchPlaceholder}
      searchAutoFocus={saleConfig.searchAutoFocus}
      quantityHint={saleConfig.quantityHint}
    />

    <SaleItemsTable
      items={items}
      onUpdateQuantity={updateQuantity}
      onUpdateUnitPrice={updateUnitPrice}
      onRemove={removeItem}
    />
  </div>

  <aside className="lg:sticky lg:top-24 lg:self-start">
    {/* SaleSummary sin cambios */}
  </aside>
</div>
```

**Checklist Fase 4:**
- [ ] Agregar `pinnedProducts` y `saleConfig` a `SaleFormProps`.
- [ ] Actualizar `addProduct` para usar `saleConfig.weightStep`.
- [ ] Insertar `QuickProductButtons` condicionalmente en el JSX.
- [ ] Pasar `searchPlaceholder`, `searchAutoFocus` y `quantityHint` a `ProductSearch`.

---

## Fase 5 — Modificar `ProductSearch` para recibir config

`ProductSearch` ya diferencia comportamiento por `businessType`. Ahora recibirá props concretas de config para evitar duplicar el branching.

### 5a — Nuevas props

```ts
type ProductSearchProps = {
  businessType: BusinessType;
  products: SaleProductOption[];
  onAddProduct: (product: SaleProductOption) => void;
  allowMobileBarcodeLink?: boolean;
  searchPlaceholder?: string;    // ← nuevo (si no viene, usa el default interno)
  searchAutoFocus?: boolean;     // ← nuevo
  quantityHint?: string | null;  // ← nuevo
};
```

### 5b — Uso en el componente

Reemplazar el bloque de placeholder por:

```ts
const placeholder =
  searchPlaceholder ??
  (businessType === "almacen"
    ? "Codigo de barras, SKU o nombre (prioridad codigo)"
    : businessType === "ferreteria"
      ? "SKU, marca, medida o nombre"
      : "Nombre o identificador");
```

El autoFocus del input:

```tsx
<input
  ref={inputRef}
  autoFocus={searchAutoFocus}
  ...
/>
```

El hint de cantidad (si viene):

```tsx
{quantityHint ? (
  <p className="text-xs text-muted-foreground">{quantityHint}</p>
) : null}
```

Eliminar el bloque `{businessType === "verduleria" ? <p>En kg...</p> : null}` que ahora viene como prop.

**Checklist Fase 5:**
- [ ] Agregar `searchPlaceholder`, `searchAutoFocus`, `quantityHint` a `ProductSearchProps`.
- [ ] Reemplazar el bloque hardcodeado de placeholder por la prop con fallback.
- [ ] Usar `autoFocus={searchAutoFocus}` en el input (por defecto `false` para no romper).
- [ ] Mostrar `quantityHint` como `<p>` condicionalmente.
- [ ] Eliminar el `<p>` hardcodeado de verdulería de dentro del componente.

---

## Fase 6 — Modificar la página de nueva venta

`app/(app)/ventas/nueva/page.tsx` es donde se orquesta todo.

```tsx
import Link from "next/link";
import { Package } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageSurface } from "@/components/ui/page-surface";
import { canUseMobileScanner } from "@/config/plans";
import { cn } from "@/lib/utils";
import { SaleForm } from "@/components/ventas/sale-form";
import { createSaleAction, getSaleFormData } from "@/modules/core/sales/actions";
import { getSaleConfig } from "@/lib/business/sale-config";  // ← nuevo

export default async function NuevaVentaPage() {
  const { business, products } = await getSaleFormData();
  const saleConfig = getSaleConfig(business.business_type);  // ← nuevo

  // Filtrar productos fijados solo si el rubro usa botones rápidos
  const pinnedProducts = saleConfig.showQuickButtons
    ? products.filter((product) => product.pinned)
    : [];

  if (!products.length) {
    return (
      <section className="space-y-6">
        <PageHeader
          title="Nueva venta"
          description="Agrega productos, valida stock y confirma la venta."
        />
        <EmptyState
          icon={<Package aria-hidden />}
          title="No hay productos para vender"
          description="Carga al menos un producto activo con precio y stock."
          action={
            <Link href="/productos/nuevo" className={cn(buttonVariants())}>
              Crear producto
            </Link>
          }
        />
      </section>
    );
  }

  return (
    <PageSurface>
      <section className="space-y-6">
        <PageHeader
          title="Nueva venta"
          description="Agrega productos, valida stock y confirma la venta."
        />
        <SaleForm
          businessType={business.business_type}
          products={products}
          pinnedProducts={pinnedProducts}   // ← nuevo
          saleConfig={saleConfig}           // ← nuevo
          action={createSaleAction}
          allowMobileBarcodeLink={canUseMobileScanner(business.subscription_plan)}
        />
      </section>
    </PageSurface>
  );
}
```

**Checklist Fase 6:**
- [ ] Importar `getSaleConfig` en la página.
- [ ] Calcular `saleConfig` y `pinnedProducts`.
- [ ] Pasar ambos a `SaleForm`.

---

## Fase 7 — Ajuste de step de cantidad en verdulería (carrito)

En `SaleItemsTable`, `quantityInputAttrs` ya define `step: 0.01` para `kg`/`g`. Eso es correcto para el input de edición manual. No hay que cambiar nada en la tabla.

Lo que sí hay que mejorar: el botón "Agregar" desde los botones rápidos de verdulería debe respetar `weightStep: 0.5` del config, no `1`. Eso ya queda cubierto en Fase 4b con la actualización de `addProduct`.

---

## Fase 8 — Indicador visual de "sin productos fijados" en verdulería

Si el rubro es verdulería pero no hay ningún producto marcado como `pinned`, conviene mostrar una guía en lugar del espacio vacío.

Esto va dentro del `SaleForm`, en la sección condicional de botones rápidos:

```tsx
{saleConfig.showQuickButtons ? (
  pinnedProducts && pinnedProducts.length > 0 ? (
    <QuickProductButtons
      products={pinnedProducts}
      onAdd={addProduct}
    />
  ) : (
    <div className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-5 text-sm text-muted-foreground">
      <p className="font-medium text-foreground">Sin accesos rápidos configurados</p>
      <p className="mt-1 text-xs">
        En la ficha de cada producto podés activar{" "}
        <span className="font-medium">Acceso rápido en ventas</span> para que aparezca aquí como botón directo.
      </p>
    </div>
  )
) : null}
```

**Checklist Fase 8:**
- [ ] Agregar el bloque de estado vacío en `SaleForm`.

---

## Estructura de archivos completa al terminar

```txt
lib/
  business/
    sale-config.ts                 ← nuevo

components/
  ventas/
    quick-product-buttons.tsx      ← nuevo
    sale-form.tsx                  ← modificar (saleConfig, pinnedProducts, QuickProductButtons)
    product-search.tsx             ← modificar (searchPlaceholder, searchAutoFocus, quantityHint)
    sale-items-table.tsx           ← sin cambios

lib/
  products/
    map-product-for-sale.ts        ← modificar (campo pinned en SaleFormProduct)

modules/
  core/
    products/
      actions.ts                   ← modificar (pinned en buildMetadataFromFormData)
  verduleria/
    product-fields.tsx             ← modificar (checkbox pinned)

app/
  (app)/
    ventas/
      nueva/
        page.tsx                   ← modificar (getSaleConfig, pinnedProducts)
```

---

## Comportamiento final por rubro

### Verdulería

1. Entrar a "Nueva venta".
2. Ver grilla de botones grandes con productos fijados (banana, papa, tomate, etc.).
3. Tocar un botón → agrega el producto con step de 0,5 kg si es por peso.
4. El buscador está disponible abajo para productos menos frecuentes.
5. En el carrito, el input de cantidad tiene `step=0.01` para ajuste fino.
6. Hint visible: "Kg y litros aceptan decimales".
7. Si no hay productos fijados, aparece guía para configurarlos.

### Almacén

1. Entrar a "Nueva venta".
2. Foco automático en el buscador.
3. Escanear código → producto agregado al instante.
4. Buscar por nombre o SKU si no hay código.
5. Scanner USB, cámara y enlace celular disponibles.
6. Sin botones rápidos (flujo pensado para código de barras).

### Ferretería

1. Entrar a "Nueva venta".
2. Foco automático en el buscador con placeholder "SKU, marca, medida o nombre".
3. Tabla de resultados muestra marca, modelo, SKU para distinguir referencias similares.
4. Scanner disponible para artículos con código.
5. Sin botones rápidos (catálogo demasiado amplio para atajos fijos).

---

## Checklist de implementación completa

- [ ] **Fase 1** — Crear `lib/business/sale-config.ts`.
- [ ] **Fase 2a** — Checkbox `pinned` en `modules/verduleria/product-fields.tsx`.
- [ ] **Fase 2b** — Campo `pinned` en `buildMetadataFromFormData` (actions.ts de productos).
- [ ] **Fase 2c** — Campo `pinned` en `SaleFormProduct` y `mapProductForSale`.
- [ ] **Fase 3** — Crear `components/ventas/quick-product-buttons.tsx`.
- [ ] **Fase 4a** — Nuevas props `pinnedProducts` y `saleConfig` en `SaleFormProps`.
- [ ] **Fase 4b** — Actualizar `addProduct` para usar `saleConfig.weightStep`.
- [ ] **Fase 4c** — Insertar `QuickProductButtons` condicionalmente en el JSX de `SaleForm`.
- [ ] **Fase 4d** — Pasar `searchPlaceholder`, `searchAutoFocus` y `quantityHint` a `ProductSearch`.
- [ ] **Fase 5a** — Nuevas props opcionales en `ProductSearchProps`.
- [ ] **Fase 5b** — Usar props con fallback para placeholder, autoFocus y hint.
- [ ] **Fase 5c** — Eliminar `<p>` hardcodeado de verdulería dentro del componente.
- [ ] **Fase 6** — Actualizar `app/(app)/ventas/nueva/page.tsx`.
- [ ] **Fase 8** — Bloque de estado vacío cuando verdulería no tiene productos fijados.
- [ ] Ejecutar `npm run lint`.
- [ ] Probar en verdulería sin productos fijados → ver guía.
- [ ] Marcar un producto como "Acceso rápido" → aparece botón en venta.
- [ ] Tocar botón → se agrega con step correcto según `unit_type`.
- [ ] Probar en almacén → sin botones rápidos, foco en buscador.
- [ ] Probar en ferretería → tabla con datos técnicos en resultados.

---

## Extensión futura

Si en el futuro se quieren agregar más rubros (cafetería, librería, etc.):

1. Agregar el tipo en `config/business-types.ts`.
2. Agregar su entry en `lib/business/sale-config.ts`.
3. Crear `modules/nuevo-rubro/product-fields.tsx`.
4. Crear `modules/nuevo-rubro/dashboard-cards.tsx`.

Ningún componente central de ventas necesita cambiar.
