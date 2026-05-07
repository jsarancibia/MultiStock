# Excel Report Engine — Skill v2

## Rol
Eres un experto en el motor de reportes Excel empresarial de MultiStock.
Diseñas archivos `.xlsx` con calidad visual de ERP (SAP Business One, Odoo, Softland).

---

## Arquitectura

```
lib/reports/excel/
  core/
    workbook.ts      ← buildReportBuffer, buildMultiSheetBuffer
    styles.ts        ← StyleSet + createStyleSet(theme) + estilos estáticos
    colors.ts        ← Brand palette ARGB
    layout.ts        ← applyBrandHeader, applyFreezePane
    tables.ts        ← applyTableHeader, applyTableBody, applyAutoFilter
    images.ts        ← registerLogoInWorkbook, placeLogoInSheet
    conditional.ts   ← ConditionalRule, applyConditionalToCell
    print.ts         ← configurePrint (pageSetup + headerFooter)
    summary.ts       ← renderSummaryCards, SummaryCard
    footer.ts        ← renderCorporateFooter
    helpers.ts       ← API alto nivel: applySheetHeader, createTableSection, createFooter, applyTheme

  themes/
    index.ts         ← ExcelTheme, ThemeId, resolveTheme()
    multistock.ts    ← Verde corporativo (default)
    corporate-blue.ts← Azul marino (SAP-style)
    dark-professional.ts← Charcoal oscuro (SaaS moderno)
    minimal-gray.ts  ← Gris neutro (Google-style)

  generators/
    inventory-report.ts
    sales-report.ts
    products-report.ts

  utils/
    autosize.ts
    currency.ts
    borders.ts
```

---

## API principal (workbook.ts)

```typescript
// API mínima
buildReportBuffer(ctx: ExcelReportContext, sheet: ReportSheetOptions): Promise<Buffer>

// Multi-hoja
buildMultiSheetBuffer(ctx, sheets: ReportSheetOptions[]): Promise<Buffer>
```

### ReportSheetOptions completo

```typescript
{
  sheetName: string;
  title: string;
  description?: string;
  theme?: ThemeId | ExcelTheme;    // "multistock" | "corporate-blue" | "dark-professional" | "minimal-gray"
  tabColor?: string;               // ARGB
  summary?: SummaryCard[];         // Cards de métricas
  footer?: boolean;                // Footer corporativo al final
  columns: ReportColumn[];
  rows: ReportRow[];
  conditionalRules?: ConditionalRule[];
}
```

### ExcelReportContext

```typescript
{
  businessId: string;
  businessName: string;
  businessTypeLabel: string;
  exportedAt: Date;
  exporterEmail?: string | null;
}
```

---

## Temas

| ThemeId               | Descripción               |
|-----------------------|---------------------------|
| `"multistock"`        | Verde (default, app color)|
| `"corporate-blue"`    | Azul marino (SAP-style)   |
| `"dark-professional"` | Charcoal (SaaS moderno)   |
| `"minimal-gray"`      | Gris neutro (Google-style)|

Crear tema custom:
```typescript
const myTheme: ExcelTheme = {
  id: "custom", name: "Mi Tema",
  colors: { headerBg: "FF8B1A1A", headerText: "FFFFFFFF", ... },
  fonts: { base: "Calibri", heading: "Calibri", titleSize: 18, headerSize: 10, dataSize: 10, metaSize: 9 },
};
```

---

## Summary Cards

```typescript
summary: [
  { label: "Total",    value: 1240, type: "primary"   },
  { label: "Alertas",  value: 12,   type: "warning"   },
  { label: "Críticos", value: 3,    type: "danger"    },
  { label: "Info",     value: 8,    type: "info"      },
]
```

Tipos: `"primary" | "secondary" | "warning" | "danger" | "info"`

---

## Formato condicional

```typescript
conditionalRules: [
  {
    columnKey: "stock",                     // columna a evaluar
    targetColumnKey: "stock",               // columna a colorear (default: misma)
    conditions: [
      { operator: "lte", threshold: 0, styleKey: "statusAlert" },
      { operator: "lte", threshold: 5, styleKey: "statusWarn"  },
      { operator: "gt",  threshold: 5, styleKey: "statusOk"    },
    ],
  },
]
```

Operadores: `"lt" | "lte" | "gt" | "gte" | "eq" | "neq" | "contains" | "startsWith"`
StyleKeys: cualquier clave del StyleSet (ver abajo)

---

## StyleSet (estilos disponibles)

```typescript
import { createStyleSet } from "../core/styles";
import { resolveTheme } from "../themes";
const styles = createStyleSet(resolveTheme("corporate-blue"));

// Usar en conditional styleKey o directamente:
styles.brandBar / styles.title / styles.subtitle / styles.meta / styles.bizName
styles.tableHeader
styles.dataLeft / styles.dataCenter / styles.dataRight
styles.dataCurrency / styles.dataQuantity / styles.dataDate / styles.dataDatetime
styles.stripe
styles.statusAlert / styles.statusOk / styles.statusWarn / styles.statusInfo
styles.kpiLabel / styles.kpiValue
styles.summaryCardLabel / styles.summaryCardValue
styles.summaryCardPrimary / styles.summaryCardWarning / styles.summaryCardDanger
styles.footer / styles.footerMeta
```

---

## Tipos de columna

```typescript
{ header: "SKU",      key: "sku",   width: 14, align: "center" }
{ header: "Producto", key: "name",  width: 36                  }  // type: "text" default
{ header: "Stock",    key: "stock", width: 10, type: "stock"   }  // colores automáticos
{ header: "Precio",   key: "price", width: 14, type: "currency"}  // $#,##0
{ header: "Cantidad", key: "qty",   width: 10, type: "number"  }  // #,##0.##
{ header: "Fecha",    key: "date",  width: 14, type: "date"    }  // dd/mm/yyyy
```

---

## Cómo crear un generator

```typescript
// lib/reports/excel/generators/inventory-report.ts
import { buildReportBuffer, type ExcelReportContext } from "../core/workbook";
import type { ReportColumn } from "../core/tables";

interface InventoryRow { sku: string; name: string; stock: number; price: number; }

export async function buildInventoryExcel(
  ctx: ExcelReportContext,
  rows: InventoryRow[]
): Promise<Buffer> {
  const stockBajo = rows.filter((r) => r.stock <= 5).length;

  const columns: ReportColumn[] = [
    { header: "SKU",      key: "sku",   width: 14, align: "center" },
    { header: "Producto", key: "name",  width: 36 },
    { header: "Stock",    key: "stock", width: 10, type: "stock"    },
    { header: "Precio",   key: "price", width: 14, type: "currency" },
  ];

  return buildReportBuffer(ctx, {
    sheetName: "Inventario",
    title: "Reporte de Inventario",
    description: "Stock actual por producto",
    theme: "multistock",
    summary: [
      { label: "Total",      value: rows.length, type: "primary" },
      { label: "Stock Bajo", value: stockBajo,   type: "warning" },
    ],
    footer: true,
    columns,
    rows: rows.map((r) => ({ sku: r.sku, name: r.name, stock: r.stock, price: r.price })),
    conditionalRules: [
      { columnKey: "stock", conditions: [
        { operator: "lte", threshold: 0, styleKey: "statusAlert" },
        { operator: "lte", threshold: 5, styleKey: "statusWarn" },
      ]},
    ],
  });
}
```

---

## Reglas de diseño

### SIEMPRE
- Header corporativo en todas las hojas
- Panel congelado en header de tabla (`applyFreezePane`)
- Autofilter en rango de datos
- Filas alternadas (stripe)
- Widths manuales en cada columna
- Orientación landscape para impresión
- Footer para reportes administrativos

### NUNCA
- Bordes en 4 lados en celdas de datos
- Estilos inline en generators
- Columnas sin `width`
- `ws.addImage` sin `tl` y `ext` fijos
- Colores con argb "FFFF0000" (rojo puro) o similares agresivos
- Mezclar lógica visual con lógica de datos

---

## Paleta de colores ARGB (Brand)

```typescript
import { Brand } from "../core/colors";
Brand.primary        // FF2E7C51 - Verde corporativo
Brand.primaryDark    // FF1C5537 - Verde oscuro
Brand.primaryFaint   // FFE8F4ED - Verde muy suave
Brand.bgPage         // FFF9F9F5 - Fondo general
Brand.bgCard         // FFFFFFFF - Celdas de datos
Brand.stripe         // FFF2EFEA - Fila alternada
Brand.textPrimary    // FF282420 - Texto principal
Brand.textSoft       // FF78736C - Texto secundario
Brand.borderLight    // FFE0DDD5 - Borde suave
Brand.okBg / Brand.okText      // Verde semántico
Brand.warnBg / Brand.warnText  // Amarillo semántico
Brand.errorBg / Brand.errorText// Rojo semántico
```

---

## Formato numérico

```typescript
import { FMT_CURRENCY, FMT_DATE, FMT_DATETIME, FMT_PERCENT } from "../utils/currency";

// En columna personalizada:
{ header: "Margen", key: "margin", width: 10, numFmt: FMT_PERCENT }

// En celda directa:
cell.numFmt = FMT_CURRENCY;
```

---

## Print Ready

Configurado automáticamente en `workbook.ts`:
- Orientación: landscape
- Papel: A4
- Fit to page: 1 columna de ancho
- Repeat headers: fila del header de tabla
- Márgenes: 0.5" lados, 0.75" top/bottom
- Header impresión: `Empresa | Título | Fecha`
- Footer impresión: `Título | Página X de N | Empresa`

Para configuración custom:
```typescript
import { configurePrint } from "../core/print";
configurePrint(ws, { orientation: "portrait", paper: "Letter" }, { reportTitle, businessName });
```

---

## Documentación completa

Ver `docs/excel-engine.md` en la raíz del proyecto.
