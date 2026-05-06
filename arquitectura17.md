# Arquitectura 17 - UI dinámica por tipo de negocio

Este documento define qué ya existe, qué falta y cómo completar la adaptación de la interfaz por rubro en MultiStock (verdulería, almacén, ferretería).

La clave es entender el estado real del proyecto antes de proponer cambios, para no duplicar lógica ni romper lo que funciona.

## 1. Estado actual — qué ya está implementado

MultiStock ya tiene un sistema de UI por rubro bastante completo. Antes de agregar código es importante saberlo.

### Base de datos

La tabla `businesses` ya tiene:

- `id`, `name`, `business_type` (`verduleria` | `almacen` | `ferreteria`), `subscription_plan`, `owner_id`, `created_at`.
- Productos con columna `metadata` (jsonb) para campos específicos por rubro.
- El onboarding ya exige seleccionar el tipo de negocio antes de continuar.

### Configuración de rubros (`config/business-types.ts`)

Ya existe un registro por tipo con:

- `label`: nombre legible.
- `modules`: módulos activos según rubro.
- `productFields`: campos específicos.
- `dashboard`: rubro del dashboard.

### Helpers de negocio (`lib/business/business-type-config.ts`)

Ya existe con:

- `getProductFocusFilterOptions(type)`: filtros de la lista de productos según rubro.
- `getRubroDashboardTitle(type)`: título del dashboard.
- `marginPercentOnCost(cost, sale)`: margen sobre costo.
- `isLowMargin(cost, sale, suggested)`: alerta de margen bajo (almacén).

### Formularios de producto por rubro (`modules/*/product-fields.tsx`)

Ya existen tres componentes separados:

- `modules/verduleria/product-fields.tsx`: perecible, vida útil, venta por peso, merma.
- `modules/almacen/product-fields.tsx`: alta rotación, margen sugerido, categoría comercial.
- `modules/ferreteria/product-fields.tsx`: marca, modelo, material, medida, especificaciones técnicas.

### Dashboard por rubro (`modules/*/dashboard-cards.tsx`)

Ya existen tres componentes de cards específicas:

- `modules/verduleria/dashboard-cards.tsx`: perecibles, merma 7 días, ventas por peso 30 días.
- `modules/almacen/dashboard-cards.tsx`: alta rotación, margen promedio.
- `modules/ferreteria/dashboard-cards.tsx`: sin movimiento 30 días, categoría top, técnicos bajo mínimo.

El dashboard ya renderiza el componente correcto con `if (businessType === ...)`.

### Ventas (`components/ventas/product-search.tsx`)

Ya tiene comportamiento diferenciado por rubro:

- Almacén: búsqueda ordenada por código de barras como prioridad.
- Ferretería: muestra marca, medida, SKU en la tabla de resultados.
- Verdulería: nota de venta por decimales (kg, litros).

### Scanner y barcode

Todos los tipos acceden al scanner (cámara y USB/Bluetooth). El plan condiciona solo el enlace por celular (`canUseMobileScanner`). Los rubros en sí no bloquean barcode: incluso una verdulería puede usar código de barras en productos envasados.

### Métricas (`lib/business/dashboard-metrics.ts`)

Ya calcula métricas específicas por rubro en paralelo y las devuelve en un objeto tipado.

---

## 2. Qué le falta al sistema

Tras el análisis, las brechas reales son:

### Brecha 1 — Botones rápidos en venta (verdulería y almacén)

En verdulería, los productos más comunes se venden varias veces por hora (banana, papa, tomate). No tiene sentido buscar cada vez.

La UI actual exige buscar el producto antes de agregarlo. No hay atajos.

**Lo que falta**: botones de acceso rápido (productos fijados) en la pantalla de venta, visibles solo en rubros con alta frecuencia operativa.

### Brecha 2 — Entrada de cantidad diferenciada por rubro

En ferretería la unidad siempre es entera (no tiene sentido vender 1,5 tornillos). En verdulería es decimal (0,850 kg de uva). En almacén depende del producto.

La UI actual usa un input genérico sin ajustar `step`, `min` ni sugerencias al rubro.

**Lo que falta**: adaptar el input de cantidad en el carrito de venta según `unit_type` y rubro.

### Brecha 3 — `business-config.ts` como fuente centralizada de comportamiento de venta

Hoy la lógica de qué mostrar según el rubro está dispersa en múltiples componentes con `if (businessType === "almacen")`. Cuando crezca el sistema, eso se vuelve difícil de mantener.

**Lo que falta**: un archivo que centralice el comportamiento de UI por rubro, para que los componentes solo lean config en vez de branching directo.

### Brecha 4 — Placeholder y UX de búsqueda más orientada al rubro

El placeholder de búsqueda en ventas ya cambia por rubro, pero podría mejorar:

- Verdulería: sugerir buscar por nombre, no por código.
- Almacén: sugerir código o SKU como primer camino.
- Ferretería: sugerir marca + medida.

---

## 3. Lo que NO hay que hacer

Antes de agregar código, estas cosas deben evitarse:

- No crear `lib/business/business-config.ts` con campos que ya existen en `config/business-types.ts` o `lib/business/business-type-config.ts`. Eso genera duplicación.
- No bloquear barcode para verdulería: productos envasados en verdulerías usan barcode normalmente.
- No crear un archivo `getBusinessConfig(type)` genérico que devuelva `useBarcode: false` para verdulería, porque eso es incorrecto para el modelo de datos actual.
- No romper la búsqueda existente de `product-search.tsx` que ya funciona bien.

---

## 4. Fase 1 — Archivo de configuración de comportamiento de venta

Crear `lib/business/sale-config.ts`.

Este archivo no reemplaza nada existente: se enfoca solo en el comportamiento de la pantalla de venta.

```ts
import type { BusinessType } from "@/config/business-types";

export type SaleConfig = {
  /**
   * Si es true, mostrar botones de acceso rápido a productos frecuentes.
   * Ideal para verdulería y almacén con pocos productos repetidos.
   */
  showQuickProductButtons: boolean;
  /**
   * Texto de ayuda del buscador de productos.
   */
  searchPlaceholder: string;
  /**
   * Si es true, priorizar el código de barras como método de entrada en búsqueda.
   */
  barcodePriority: boolean;
  /**
   * Mensaje breve sobre cómo ingresar cantidades en esta vista.
   */
  quantityHint: string | null;
};

export const saleConfigByType: Record<BusinessType, SaleConfig> = {
  verduleria: {
    showQuickProductButtons: true,
    searchPlaceholder: "Nombre del producto (ej: banana, papa)",
    barcodePriority: false,
    quantityHint: "Kg o g se ingresan con decimales (ej: 0,850).",
  },
  almacen: {
    showQuickProductButtons: false,
    searchPlaceholder: "Código de barras, SKU o nombre",
    barcodePriority: true,
    quantityHint: null,
  },
  ferreteria: {
    showQuickProductButtons: false,
    searchPlaceholder: "SKU, marca, medida o nombre",
    barcodePriority: true,
    quantityHint: null,
  },
};

export function getSaleConfig(type: BusinessType): SaleConfig {
  return saleConfigByType[type];
}
```

Este archivo define únicamente la experiencia de venta. El resto del comportamiento por rubro sigue donde ya está.

---

## 5. Fase 2 — Modelo de datos para productos fijados (quick buttons)

Los botones rápidos necesitan que el usuario pueda "fijar" productos desde el formulario de producto. No hay que crear una tabla nueva: se puede usar el campo `metadata` de `products`.

Agregar a `metadata` de cualquier producto un campo booleano:

```json
{ "pinned": true }
```

No requiere migración de base de datos. Solo un campo más en el JSONB existente.

La consulta para obtener productos fijados en ventas:

```ts
const { data } = await supabase
  .from("products")
  .select("id,name,unit_type,sale_price,current_stock,metadata")
  .eq("business_id", business.id)
  .eq("active", true)
  .contains("metadata", { pinned: true })
  .order("name", { ascending: true });
```

---

## 6. Fase 3 — Componente de botones rápidos

Crear `components/ventas/quick-product-buttons.tsx`.

```tsx
"use client";

import type { SaleProductOption } from "@/components/ventas/product-search";

type QuickProductButtonsProps = {
  products: SaleProductOption[];
  onAdd: (product: SaleProductOption) => void;
};

export function QuickProductButtons({ products, onAdd }: QuickProductButtonsProps) {
  if (!products.length) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">Acceso rápido</p>
      <div className="flex flex-wrap gap-2">
        {products.map((product) => (
          <button
            key={product.id}
            type="button"
            onClick={() => onAdd(product)}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted active:scale-[0.98]"
          >
            {product.name}
          </button>
        ))}
      </div>
    </div>
  );
}
```

---

## 7. Fase 4 — Campo "Producto fijado" en formulario de producto

Agregar el campo a `modules/verduleria/product-fields.tsx` (y opcionalmente a almacén):

```tsx
<label className="flex items-center gap-2 text-sm text-foreground">
  <input
    type="checkbox"
    name="pinned"
    defaultChecked={checkedOf(metadata, "pinned")}
  />
  Acceso rápido en ventas
</label>
<p className="text-xs text-muted-foreground pl-6">
  Si está activo, aparece como botón de acceso rápido en la pantalla de venta.
</p>
```

En las acciones de producto, el campo `pinned` ya se procesa dentro de `buildMetadataFromFormData` porque ese helper ya incluye lo que viene del formulario por rubro.

---

## 8. Fase 5 — Integración en la pantalla de venta

Modificar `app/(app)/ventas/nueva/page.tsx` para:

1. Obtener `saleConfig` según rubro.
2. Si `showQuickProductButtons` es `true`, filtrar productos fijados.
3. Pasar ambos al formulario.

```tsx
import { getSaleConfig } from "@/lib/business/sale-config";

export default async function NuevaVentaPage() {
  const { business, products } = await getSaleFormData();
  const saleConfig = getSaleConfig(business.business_type);

  const pinnedProducts = saleConfig.showQuickProductButtons
    ? products.filter((product) => {
        const meta = product.metadata as Record<string, unknown> | null;
        return meta?.pinned === true;
      })
    : [];

  return (
    <PageSurface>
      <section className="space-y-6">
        <PageHeader title="Nueva venta" description="..." />
        <SaleForm
          businessType={business.business_type}
          products={products}
          pinnedProducts={pinnedProducts}
          saleConfig={saleConfig}
          action={createSaleAction}
          allowMobileBarcodeLink={canUseMobileScanner(business.subscription_plan)}
        />
      </section>
    </PageSurface>
  );
}
```

En `SaleForm` y `ProductSearch`, usar `saleConfig.searchPlaceholder` para el placeholder del buscador en lugar del branching actual por `businessType`.

---

## 9. Fase 6 — Input de cantidad adaptado al rubro

En `components/ventas/sale-items-table.tsx` (o donde se edite la cantidad por ítem), el step del input debe depender del `unit_type`:

```ts
function getQuantityStep(unitType: string): string {
  if (unitType === "kg" || unitType === "liter" || unitType === "g") return "0.001";
  return "1";
}

function getQuantityMin(unitType: string): string {
  if (unitType === "kg" || unitType === "liter" || unitType === "g") return "0.001";
  return "1";
}
```

Estos helpers no dependen del `businessType`: dependen solo del `unit_type` del producto. Eso es correcto porque un almacén puede tener jabón líquido vendido por litro.

---

## 10. Estructura de archivos propuesta

```txt
lib/
  business/
    sale-config.ts          ← nuevo: config de comportamiento de venta por rubro

components/
  ventas/
    quick-product-buttons.tsx   ← nuevo: botones de acceso rápido
    sale-items-table.tsx        ← modificar: step/min según unit_type

modules/
  verduleria/
    product-fields.tsx      ← modificar: agregar campo "pinned"
  almacen/
    product-fields.tsx      ← modificar: agregar campo "pinned" (opcional)

app/
  (app)/
    ventas/
      nueva/
        page.tsx            ← modificar: pasar saleConfig y pinnedProducts
```

No se crean rutas nuevas. No se toca la base de datos.

---

## 11. Consideraciones de escalabilidad

Cuando el sistema crezca con más rubros (por ejemplo cafetería, librería), el proceso sería:

1. Agregar el nuevo tipo en `config/business-types.ts`.
2. Agregar su entry en `saleConfigByType` en `lib/business/sale-config.ts`.
3. Crear `modules/nuevo-rubro/product-fields.tsx` con sus campos específicos.
4. Opcionalmente crear `modules/nuevo-rubro/dashboard-cards.tsx`.

No hay que modificar ningún componente central de ventas, dashboard o productos.

---

## 12. Checklist de implementación

Base de datos:

- [ ] No se requieren migraciones (se usa `metadata` jsonb existente).

Config:

- [ ] Crear `lib/business/sale-config.ts` con `SaleConfig`, `saleConfigByType` y `getSaleConfig()`.

Producto:

- [ ] Agregar campo `pinned` en `modules/verduleria/product-fields.tsx`.
- [ ] Considerar agregar `pinned` en `modules/almacen/product-fields.tsx`.
- [ ] Verificar que `buildMetadataFromFormData` recoge `pinned` en las actions de producto.

Componentes:

- [ ] Crear `components/ventas/quick-product-buttons.tsx`.
- [ ] Ajustar `step` y `min` del input de cantidad en `sale-items-table.tsx` según `unit_type`.
- [ ] Reemplazar `searchPlaceholder` hardcodeado en `product-search.tsx` usando `saleConfig`.

Páginas:

- [ ] Modificar `app/(app)/ventas/nueva/page.tsx` para obtener `saleConfig` y `pinnedProducts`.
- [ ] Pasar `saleConfig` y `pinnedProducts` a `SaleForm`.

Calidad:

- [ ] Ejecutar `npm run lint`.
- [ ] Probar en verdulería: verificar que aparecen botones rápidos (si hay productos fijados).
- [ ] Probar en almacén: verificar que NO aparecen botones rápidos.
- [ ] Probar ferretería: verificar que la búsqueda prioriza SKU y técnicos.
- [ ] Probar cantidad decimal en productos con `unit_type = kg`.
- [ ] Probar cantidad entera en productos con `unit_type = unit`.

---

## 13. Resultado esperado

- Verdulería: botones rápidos para productos fijados + buscador por nombre + cantidades decimales.
- Almacén: buscador por código de barras prioritario + cantidades según producto.
- Ferretería: buscador por SKU/marca/medida + cantidades enteras por defecto.
- Escala limpiamente: agregar un rubro nuevo requiere solo dos archivos y una entry en config.
- No rompe nada existente: el sistema actual sigue funcionando sin cambios visibles.
