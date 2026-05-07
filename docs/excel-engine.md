# Excel Report Engine — Documentación

Motor de reportes Excel empresarial para MultiStock ERP.
Genera archivos `.xlsx` con calidad visual de sistema SaaS profesional.

---

## Arquitectura

```
lib/reports/excel/
  core/
    workbook.ts      ← Orquestador: buildReportBuffer, buildMultiSheetBuffer
    styles.ts        ← Estilos estáticos + StyleSet + createStyleSet()
    colors.ts        ← Paleta ARGB base (Brand)
    layout.ts        ← Header corporativo + freeze pane
    tables.ts        ← Header/body de tabla + autofilter + condicionales
    images.ts        ← Logo PNG helper
    conditional.ts   ← Formato condicional programático
    print.ts         ← Configuración de impresión (pageSetup, headerFooter)
    summary.ts       ← Summary cards (métricas tipo dashboard)
    footer.ts        ← Footer corporativo al final de datos
    helpers.ts       ← API de alto nivel para generators avanzados

  themes/
    index.ts         ← ExcelTheme type, ThemeId, resolveTheme()
    multistock.ts    ← Tema verde (default)
    corporate-blue.ts← Tema azul marino (SAP Business One style)
    dark-professional.ts ← Tema charcoal oscuro (SaaS moderno)
    minimal-gray.ts  ← Tema gris mínimo (Google Workspace style)

  generators/
    inventory-report.ts
    sales-report.ts
    products-report.ts

  utils/
    autosize.ts      ← Cálculo de anchos óptimos
    currency.ts      ← Formatos numéricos y fechas
    borders.ts       ← Estilos de borde reutilizables
```

---

## Uso rápido

### Generator mínimo

```typescript
import { buildReportBuffer, type ExcelReportContext } from "../core/workbook";
import type { ReportColumn, ReportRow } from "../core/tables";

export async function buildInventoryExcel(
  ctx: ExcelReportContext,
  rows: InventoryRow[]
): Promise<Buffer> {
  const columns: ReportColumn[] = [
    { header: "SKU",         key: "sku",      width: 14, align: "center" },
    { header: "Producto",    key: "name",     width: 36 },
    { header: "Categoría",   key: "category", width: 18 },
    { header: "Stock",       key: "stock",    width: 10, type: "stock" },
    { header: "Precio",      key: "price",    width: 14, type: "currency" },
  ];

  return buildReportBuffer(ctx, {
    sheetName: "Inventario",
    title: "Reporte de Inventario",
    description: "Stock actual por producto y categoría",
    columns,
    rows: rows.map((r) => ({
      sku: r.sku,
      name: r.name,
      category: r.category_name,
      stock: r.current_stock,
      price: r.selling_price,
    })),
  });
}
```

### Generator con todas las opciones

```typescript
export async function buildInventoryExcel(
  ctx: ExcelReportContext,
  rows: InventoryRow[]
): Promise<Buffer> {
  const stockBajo = rows.filter((r) => r.current_stock <= 5).length;
  const valorTotal = rows.reduce((sum, r) => sum + r.current_stock * r.selling_price, 0);

  return buildReportBuffer(ctx, {
    sheetName: "Inventario",
    title: "Reporte de Inventario",
    description: "Stock actual por producto, categoría y precio",
    theme: "corporate-blue",             // ← Tema azul

    summary: [                           // ← Cards de métricas
      { label: "Total Productos", value: rows.length,       type: "primary"   },
      { label: "Stock Bajo",      value: stockBajo,         type: "warning"   },
      { label: "Sin Stock",       value: 0,                 type: "danger"    },
      { label: "Valor Inventario",value: `$${valorTotal.toLocaleString()}`, type: "primary" },
    ],

    footer: true,                        // ← Footer corporativo

    columns: [
      { header: "SKU",      key: "sku",      width: 14, align: "center" },
      { header: "Producto", key: "name",     width: 36 },
      { header: "Stock",    key: "stock",    width: 10, type: "stock"    },
      { header: "Precio",   key: "price",    width: 14, type: "currency" },
    ],

    rows: rows.map((r) => ({
      sku: r.sku,
      name: r.name,
      stock: r.current_stock,
      price: r.selling_price,
    })),

    conditionalRules: [                  // ← Formato condicional
      {
        columnKey: "stock",
        conditions: [
          { operator: "lte", threshold: 0, styleKey: "statusAlert" },
          { operator: "lte", threshold: 5, styleKey: "statusWarn"  },
          { operator: "gt",  threshold: 5, styleKey: "statusOk"    },
        ],
      },
    ],
  });
}
```

---

## Temas disponibles

| ThemeId             | Descripción                                        | Inspiración             |
|---------------------|----------------------------------------------------|-------------------------|
| `"multistock"`      | Verde corporativo (default)                        | Tema de la app          |
| `"corporate-blue"`  | Azul marino + datos sobre blanco                   | SAP Business One        |
| `"dark-professional"` | Charcoal oscuro + datos sobre blanco             | Vercel, Linear, GitHub  |
| `"minimal-gray"`    | Gris neutro + blanco puro                          | Google Workspace        |

### Usar un tema

```typescript
// Por ID (recomendado)
buildReportBuffer(ctx, { theme: "corporate-blue", ... })

// Objeto personalizado
import type { ExcelTheme } from "../themes/index";

const myTheme: ExcelTheme = {
  id: "my-theme",
  name: "Mi Tema",
  colors: {
    headerBg: "FF8B1A1A",      // Rojo oscuro
    headerText: "FFFFFFFF",
    brandBarBg: "FFFDF0F0",
    brandBarText: "FF8B1A1A",
    // ... resto de colores
  },
  fonts: { base: "Calibri", heading: "Calibri", titleSize: 18, headerSize: 10, dataSize: 10, metaSize: 9 },
};

buildReportBuffer(ctx, { theme: myTheme, ... })
```

---

## Tipos de columna

| `type`       | Formato aplicado          | Alineación default |
|--------------|---------------------------|--------------------|
| `"text"`     | Sin formato               | Izquierda          |
| `"number"`   | `#,##0.##`                | Derecha            |
| `"currency"` | `"$"#,##0`                | Derecha            |
| `"date"`     | `dd/mm/yyyy`              | Izquierda          |
| `"datetime"` | `dd/mm/yyyy hh:mm`        | Izquierda          |
| `"stock"`    | Colores semánticos auto   | Derecha            |
| `"status"`   | Texto libre con estilo    | Centro             |

---

## Summary Cards

```typescript
summary: [
  { label: "Total Productos",   value: 1240,     type: "primary"   },
  { label: "Stock Bajo",        value: 12,        type: "warning"   },
  { label: "Sin Stock",         value: 3,         type: "danger"    },
  { label: "Categorías",        value: 8,         type: "secondary" },
  { label: "Valor Total",       value: "$1.45M",  type: "info"      },
]
```

Tipos de card:
- `"primary"` → Acento del tema (verde, azul, etc.)
- `"secondary"` → Gris neutro
- `"warning"` → Amarillo advertencia
- `"danger"` → Rojo crítico
- `"info"` → Azul informativo

---

## Formato condicional

```typescript
conditionalRules: [
  {
    columnKey: "stock",           // Columna a evaluar
    targetColumnKey: "stock",     // Columna a colorear (opcional, default: misma)
    conditions: [
      { operator: "lte", threshold: 0,  styleKey: "statusAlert" }, // Rojo
      { operator: "lte", threshold: 5,  styleKey: "statusWarn"  }, // Amarillo
      { operator: "gt",  threshold: 5,  styleKey: "statusOk"    }, // Verde
    ],
  },
  {
    columnKey: "estado",
    conditions: [
      { operator: "eq", threshold: "Inactivo", styleKey: "statusAlert" },
      { operator: "eq", threshold: "Activo",   styleKey: "statusOk"   },
    ],
  },
]
```

Operadores disponibles: `"lt"`, `"lte"`, `"gt"`, `"gte"`, `"eq"`, `"neq"`, `"contains"`, `"startsWith"`

---

## Multi-hoja

```typescript
import { buildMultiSheetBuffer } from "../core/workbook";

export async function buildFullInventoryReport(ctx, data) {
  return buildMultiSheetBuffer(ctx, [
    {
      sheetName: "Inventario",
      title: "Inventario General",
      theme: "multistock",
      columns: [...],
      rows: data.inventory,
    },
    {
      sheetName: "Alertas",
      title: "Alertas de Stock",
      theme: "dark-professional",
      summary: [{ label: "Críticos", value: data.alerts.length, type: "danger" }],
      columns: [...],
      rows: data.alerts,
    },
  ]);
}
```

---

## Estilos disponibles (StyleSet)

Al trabajar con `helpers.ts` o directamente con StyleSet:

```typescript
import { createStyleSet } from "../core/styles";
import { resolveTheme } from "../themes";

const styles = createStyleSet(resolveTheme("corporate-blue"));

// Estilos de zona de marca
styles.brandBar       // Barra superior "MultiStock"
styles.title          // Título principal del reporte
styles.subtitle       // Descripción/subtítulo
styles.meta           // Metadatos pequeños (fecha, etc.)
styles.bizName        // Nombre del negocio

// Estilos de encabezado de tabla
styles.tableHeader    // Encabezado de columna (fondo tema, texto blanco)

// Estilos de datos
styles.dataLeft       // Texto alineado izquierda
styles.dataCenter     // Texto centrado
styles.dataRight      // Texto alineado derecha
styles.dataCurrency   // Moneda ($#,##0)
styles.dataQuantity   // Número (#,##0.##)
styles.dataDate       // Fecha (dd/mm/yyyy)
styles.dataDatetime   // Fecha+hora (dd/mm/yyyy hh:mm)
styles.stripe         // Overlay de fila alternada (solo fill)

// Estilos de estado
styles.statusAlert    // Rojo suave (crítico)
styles.statusOk       // Verde suave (normal)
styles.statusWarn     // Amarillo (advertencia)
styles.statusInfo     // Azul (informativo)

// Estilos de KPI/Resumen
styles.kpiLabel       // Etiqueta KPI
styles.kpiValue       // Valor KPI destacado

// Estilos de summary cards
styles.summaryCardLabel   // Etiqueta de card
styles.summaryCardValue   // Valor de card (neutral)
styles.summaryCardPrimary // Valor con acento del tema
styles.summaryCardWarning // Valor con color advertencia
styles.summaryCardDanger  // Valor con color crítico

// Footer
styles.footer         // Texto footer centrado
styles.footerMeta     // Metadatos del footer (izquierda)
```

---

## Conexión con API Routes (Next.js)

```typescript
// app/api/exportaciones/[report]/excel/route.ts
import { buildReportBuffer } from "@/lib/reports/excel/core/workbook";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request, { params }: { params: { report: string } }) {
  const supabase = createClient();
  const { data: session } = await supabase.auth.getSession();

  const ctx = {
    businessId: session.user.user_metadata.business_id,
    businessName: session.user.user_metadata.business_name,
    businessTypeLabel: "Almacén",
    exportedAt: new Date(),
    exporterEmail: session.user.email,
  };

  let buffer: Buffer;

  switch (params.report) {
    case "inventory":
      const { data } = await supabase.from("products").select("*");
      buffer = await buildInventoryExcel(ctx, data ?? []);
      break;
    // ...
  }

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="reporte-${params.report}.xlsx"`,
    },
  });
}
```

---

## Reglas de diseño

### SIEMPRE
- Header corporativo en todas las hojas
- Panel congelado en header de tabla
- Autofilter en todas las columnas de datos
- Filas alternadas (stripe) para lectura fácil
- Anchos de columna definidos manualmente
- Orientación landscape para impresión

### NUNCA
- Bordes negros excesivos en celdas de datos
- Estilos inline en generators (usar StyleSet)
- Columnas sin `width` definido
- Imágenes sin anchor (`tl` + `ext` fijos)
- Colores brillantes o de alto contraste

---

## Agregar un nuevo reporte

1. Crear `lib/reports/excel/generators/nombre-report.ts`
2. Definir `ReportColumn[]` con headers, keys, widths y types
3. Mapear datos del dominio a `ReportRow[]`
4. Llamar `buildReportBuffer(ctx, { theme, summary, footer, columns, rows, conditionalRules })`
5. Retornar el Buffer
6. Conectar en el API route correspondiente

**Tiempo estimado: 15-30 minutos por generator.**
