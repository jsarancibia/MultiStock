# Excel Report Engine — Skill

## Rol
Eres un experto en generación de reportes Excel empresariales con ExcelJS y TypeScript.
Diseñas archivos Excel que se ven como salidas de ERP reales (SAP Business One, Odoo, Softland).

---

## Arquitectura obligatoria

```
lib/reports/excel/
  core/
    workbook.ts      ← Orquestador principal (ExcelReportContext, createReportWorkbook)
    styles.ts        ← Estilos reutilizables (NO inline en otros archivos)
    colors.ts        ← Paleta ARGB del sistema de diseño
    layout.ts        ← Header corporativo (logo, título, meta, separador)
    tables.ts        ← Helpers de tabla (header, body, autofilter)
    images.ts        ← Logo helper (cargar imagen al workbook)
  generators/
    inventory-report.ts
    sales-report.ts
    products-report.ts
  utils/
    autosize.ts      ← Calcular anchos de columna óptimos
    currency.ts      ← Formatos numéricos (moneda, cantidad, porcentaje)
    borders.ts       ← Estilos de borde consistentes
```

---

## Tipos principales

```typescript
// workbook.ts
export type ExcelReportContext = {
  businessId: string;
  businessName: string;
  businessTypeLabel: string;
  exportedAt: Date;
  exporterEmail?: string | null;
};

export type ReportColumn = {
  header: string;
  key: string;
  width: number;
  align?: "left" | "center" | "right";
  numFmt?: string;
  type?: "text" | "number" | "currency" | "date" | "status";
};

export type ReportRow = Record<string, string | number | Date | null | undefined>;

export type ReportSheetOptions = {
  sheetName: string;
  title: string;
  description?: string;
  tabColor?: string;
  columns: ReportColumn[];
  rows: ReportRow[];
};
```

---

## Estilos disponibles (styles.ts)

Importar siempre de `"../core/styles"`:

| Nombre         | Uso                                        |
|----------------|--------------------------------------------|
| `titleStyle`   | Título del reporte (grande, negrita)       |
| `subtitleStyle`| Descripción / subtítulo (italic, suave)    |
| `headerStyle`  | Encabezado de columna (fondo verde, blanco)|
| `metaStyle`    | Metadatos (fecha, negocio, pequeño)        |
| `centeredStyle`| Celda centrada                             |
| `leftStyle`    | Celda alineada izquierda                   |
| `rightStyle`   | Celda alineada derecha                     |
| `currencyStyle`| Celda moneda ($#,##0)                      |
| `quantityStyle`| Celda numérica (#,##0.##)                  |
| `dateStyle`    | Celda fecha                                |
| `stockAlertStyle` | Stock bajo (fondo rojo suave)           |
| `stockOkStyle`    | Stock normal (fondo verde suave)        |
| `stockWarnStyle`  | Stock en riesgo (fondo amarillo suave)  |
| `stripeStyle`  | Fila alternada (fondo gris muy suave)      |
| `brandBarStyle`| Barra superior de marca                    |

**NUNCA repetir estilos inline en generators.** Siempre importar y reutilizar.

---

## Flujo de generación

```typescript
// Ejemplo de un generator (inventory-report.ts)
import { buildReportBuffer, ExcelReportContext, ReportSheetOptions } from "../core/workbook";

export async function buildInventoryExcel(
  ctx: ExcelReportContext,
  rows: InventoryRow[]
): Promise<Buffer> {
  const columns: ReportColumn[] = [
    { header: "SKU", key: "sku", width: 14, align: "center" },
    { header: "Producto", key: "name", width: 36, align: "left" },
    { header: "Categoría", key: "category", width: 18, align: "left" },
    { header: "Stock", key: "stock", width: 10, align: "right", type: "number" },
    { header: "Precio Venta", key: "price", width: 14, align: "right", type: "currency" },
  ];

  const sheet: ReportSheetOptions = {
    sheetName: "Inventario",
    title: "Reporte de Inventario",
    description: "Stock actual por producto y categoría",
    columns,
    rows: rows.map((r) => ({
      sku: r.sku,
      name: r.name,
      category: r.category,
      stock: r.current_stock,
      price: r.price,
    })),
  };

  return buildReportBuffer(ctx, sheet);
}
```

---

## Reglas de diseño

### SIEMPRE hacer
- Header corporativo en todas las hojas (logo + título + fecha + negocio)
- Panel congelado en la fila de encabezado de tabla
- Autofilter en todas las columnas de datos
- Filas alternadas (stripeStyle) para lectura fácil
- Anchos de columna definidos manualmente (no autosize desordenado)
- Borde inferior suave en header de tabla
- Fuente Calibri 10pt para datos, 18pt para título

### NUNCA hacer
- Bordes negros excesivos en celdas de datos
- `cell.border` con 4 lados en cada fila de datos
- Imágenes flotando sin anchor correcto
- Estilos inline repetidos en cada celda
- Columnas `width: 0` o dejarlas sin definir
- Más de 2 hojas sin justificación clara
- Colores brillantes o contrastantes agresivos

---

## Colores del sistema (colors.ts)

La paleta está alineada con el tema de la app (verde oscuro ERP):

```typescript
import { Brand } from "../core/colors";

Brand.primary       // Verde corporativo principal: FF2E7C51
Brand.primaryDark   // Verde oscuro encabezados: FF1C5537
Brand.primaryLight  // Verde claro acento: FF4A9B6F
Brand.primaryFaint  // Verde muy suave fondo: FFE8F4ED
Brand.bgPage        // Fondo claro: FFF9F9F5
Brand.textPrimary   // Texto principal: FF282420
Brand.textSoft      // Texto secundario: FF78736C
Brand.borderLight   // Borde suave: FFE0DDD5
Brand.stripe        // Fila alternada: FFF2EFEA
```

---

## Posición del logo

```typescript
// Correcto (images.ts)
ws.addImage(logoId, {
  tl: { col: 0.1, row: 0.1 },   // fracción de celda
  ext: { width: 56, height: 34 }, // píxeles fijos
});
```

- `tl` → top-left en unidades de celda (fraccionarias)
- `ext` → tamaño en píxeles (SIEMPRE fijo, nunca libre)
- Anclado a rows 1-2 del header corporativo
- Si no hay logo PNG disponible, omitir silenciosamente

---

## Freeze pane

```typescript
// Correcto: congelar hasta la fila de header de tabla
ws.views = [{ state: "frozen", ySplit: headerRowNumber }];
```

`headerRowNumber` = número de fila donde está el header de la tabla (después del brand header).

---

## Ejemplo de estructura visual

```
┌─────────────────────────────────────────────────────┐
│ [Logo]  MultiStock · Reporte de Inventario  [Negocio]│  ← Row 1 (brandBar)
│         Descripción del reporte      [Fecha export]  │  ← Row 2 (título + meta)
│ ─────────────────────────────────────────────────── │  ← Row 3 (separator, h=6)
│  SKU   │  Producto  │  Categoría  │  Stock  │  Precio│  ← Row 4 (headerStyle)
│────────┼────────────┼─────────────┼─────────┼────────│
│  ABC01 │  Producto A│  Cat 1      │     25  │  $1.500│  ← alternating stripe
│  ABC02 │  Producto B│  Cat 2      │      8  │  $3.200│
└─────────────────────────────────────────────────────┘
```

---

## Cómo agregar un nuevo reporte

1. Crear `lib/reports/excel/generators/nombre-report.ts`
2. Definir columnas con `ReportColumn[]`
3. Mapear datos del dominio a `ReportRow[]`
4. Llamar `buildReportBuffer(ctx, sheet)` y retornar el Buffer
5. Conectar en el API route correspondiente: `route.ts` → `buildXxxExcel(ctx, rows)`

**NO duplicar lógica de header, estilos, o tabla. Todo ya está en `core/`.**

---

## Notas técnicas

- ExcelJS usa ARGB (ej. `"FF2E7C51"` = opacidad FF + hex RGB)
- `ws.addImage()` requiere que el buffer sea PNG o JPEG
- `cell.fill` debe ser `{ type: "pattern", pattern: "solid", fgColor: { argb: "..." } }`
- Para merged cells: setear estilo solo en la celda top-left de la fusión
- `workbook.xlsx.writeBuffer()` retorna `Buffer` compatible con Next.js API routes
