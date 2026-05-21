/**
 * Motor principal del sistema de reportes Excel.
 *
 * Orquesta el pipeline completo:
 *   workbook → tema → logo → header corporativo → summary cards →
 *   header de tabla → datos → footer → freeze → autofilter → print → Buffer
 *
 * FLUJO DE USO (en un generator):
 * ─────────────────────────────────────────────────────────────────────
 * import { buildReportBuffer, type ExcelReportContext, type ReportSheetOptions } from "../core/workbook";
 *
 * export async function buildInventoryExcel(
 *   ctx: ExcelReportContext,
 *   rows: InventoryRow[]
 * ): Promise<Buffer> {
 *   return buildReportBuffer(ctx, {
 *     sheetName: "Inventario",
 *     title: "Reporte de Inventario",
 *     description: "Stock actual por producto y categoría",
 *     theme: "corporate-blue",                    // opcional
 *     summary: [                                   // opcional
 *       { label: "Total Productos", value: rows.length, type: "primary" },
 *       { label: "Stock Bajo", value: 12, type: "warning" },
 *     ],
 *     footer: true,                               // opcional
 *     columns: [...],
 *     rows: rows.map((r) => ({ ... })),
 *   });
 * }
 * ─────────────────────────────────────────────────────────────────────
 */
import ExcelJS from "exceljs";
import { createStyleSet } from "./styles";
import { registerLogoInWorkbook } from "./images";
import { applyBrandHeader, applyFreezePane, type LayoutContext } from "./layout";
import { applyTableHeader, applyTableBody, applyAutoFilter } from "./tables";
import { renderSummaryCards, type SummaryCard } from "./summary";
import { renderCorporateFooter } from "./footer";
import { configurePrint } from "./print";
import { resolveTheme, type ThemeId, type ExcelTheme } from "../themes/index";
import type { ConditionalRule } from "./conditional";

export type { ConditionalRule };

// ── Tipos públicos ─────────────────────────────────────────────────────────

export type { ReportColumn, ReportRow } from "./tables";

/**
 * Contexto del negocio para el header corporativo y metadatos del archivo.
 */
export type ExcelReportContext = {
  businessId: string;
  businessName: string;
  businessTypeLabel: string;
  exportedAt: Date;
  exporterEmail?: string | null;
  timeZone?: string;
};

/**
 * Opciones completas para una hoja de datos.
 */
export type ReportSheetOptions = {
  /** Nombre de la pestaña en Excel */
  sheetName: string;
  /** Título principal del reporte (mostrado en el header) */
  title: string;
  /** Descripción corta (opcional) */
  description?: string;
  /**
   * Tema visual. Acepta un ThemeId predefinido o un objeto ExcelTheme personalizado.
   * Default: "multistock" (verde corporativo)
   */
  theme?: ThemeId | ExcelTheme;
  /** Color de la pestaña en formato ARGB. Si no se especifica, usa el color del tema. */
  tabColor?: string;
  /** Summary cards a mostrar entre el header y la tabla */
  summary?: SummaryCard[];
  /** Mostrar footer corporativo al final de los datos. Default: false */
  footer?: boolean;
  /** Definición de columnas */
  columns: import("./tables").ReportColumn[];
  /** Filas de datos */
  rows: import("./tables").ReportRow[];
  /** Reglas de formato condicional programático */
  conditionalRules?: ConditionalRule[];
};

// ── Builder principal (API de alto nivel) ──────────────────────────────────

/**
 * Genera un Buffer de Excel completo a partir de un contexto y una configuración de hoja.
 * Es la función principal que llaman los generators.
 */
export async function buildReportBuffer(
  ctx: ExcelReportContext,
  sheet: ReportSheetOptions
): Promise<Buffer> {
  const workbook = createWorkbook(ctx);
  const logoId = await registerLogoInWorkbook(workbook);
  await addDataSheet(workbook, ctx, sheet, logoId);
  return serializeWorkbook(workbook);
}

/**
 * Versión multi-hoja: genera un workbook con múltiples hojas de datos.
 * Cada hoja puede tener su propio tema, summary cards y footer.
 */
export async function buildMultiSheetBuffer(
  ctx: ExcelReportContext,
  sheets: ReportSheetOptions[]
): Promise<Buffer> {
  const workbook = createWorkbook(ctx);
  const logoId = await registerLogoInWorkbook(workbook);
  for (const sheet of sheets) {
    await addDataSheet(workbook, ctx, sheet, logoId);
  }
  return serializeWorkbook(workbook);
}

// ── Funciones internas ─────────────────────────────────────────────────────

function createWorkbook(ctx: ExcelReportContext): ExcelJS.Workbook {
  const wb = new ExcelJS.Workbook();
  wb.creator = ctx.exporterEmail ?? "MultiStock";
  wb.company = ctx.businessName;
  wb.created = ctx.exportedAt;
  wb.modified = ctx.exportedAt;
  return wb;
}

async function addDataSheet(
  workbook: ExcelJS.Workbook,
  ctx: ExcelReportContext,
  opts: ReportSheetOptions,
  logoId?: number
): Promise<void> {
  // 1. Resolver tema y StyleSet
  const theme = resolveTheme(opts.theme);
  const styles = createStyleSet(theme);

  const ws = workbook.addWorksheet(opts.sheetName, {
    properties: {
      tabColor: opts.tabColor
        ? { argb: opts.tabColor }
        : { argb: theme.colors.headerBg },
    },
  });

  const colCount = opts.columns.length;

  // 2. Header corporativo
  const layoutCtx: LayoutContext = {
    reportTitle: opts.title,
    reportDescription: opts.description,
    businessName: ctx.businessName,
    businessTypeLabel: ctx.businessTypeLabel,
    exportedAt: ctx.exportedAt,
    timeZone: ctx.timeZone,
  };

  let nextRow = applyBrandHeader(ws, layoutCtx, colCount, logoId, styles);

  // 3. Summary cards (opcional)
  if (opts.summary && opts.summary.length > 0) {
    nextRow = renderSummaryCards(ws, opts.summary, nextRow, colCount, styles);
  }

  // 4. Header de tabla
  const tableHeaderRow = nextRow;
  applyTableHeader(ws, opts.columns, tableHeaderRow, styles);

  // 5. Datos con formato condicional
  const firstDataRow = tableHeaderRow + 1;
  const lastDataRow =
    opts.rows.length > 0
      ? applyTableBody(ws, opts.columns, opts.rows, firstDataRow, styles, opts.conditionalRules)
      : firstDataRow - 1;

  // 6. Freeze pane en el header de tabla
  applyFreezePane(ws, tableHeaderRow);

  // 7. Autofilter
  if (opts.rows.length > 0) {
    applyAutoFilter(ws, tableHeaderRow, lastDataRow, colCount);
  }

  // 8. Footer corporativo (opcional)
  if (opts.footer && opts.rows.length > 0) {
    renderCorporateFooter(ws, ctx, lastDataRow + 1, colCount, opts.title, styles);
  }

  // 9. Configuración de impresión
  configurePrint(
    ws,
    {
      orientation: "landscape",
      paper: "A4",
      fitToPage: true,
      fitToWidth: 1,
      repeatHeaderRow: tableHeaderRow,
    },
    { reportTitle: opts.title, businessName: ctx.businessName }
  );
}

async function serializeWorkbook(workbook: ExcelJS.Workbook): Promise<Buffer> {
  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}
