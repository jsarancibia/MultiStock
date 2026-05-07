/**
 * Helpers de alto nivel para generación de reportes Excel.
 *
 * Estos helpers componen las funciones de bajo nivel (layout, tables, summary, footer)
 * en una API más simple para los generators, sin exponer detalles internos.
 *
 * Uso típico en un generator:
 *
 *   import { createWorksheetWithHeader, createTableSection, createFooter } from "../core/helpers";
 *
 *   export async function buildInventoryExcel(...): Promise<Buffer> {
 *     const { workbook, ws, styles, tableHeaderRow } = await createWorksheetWithHeader(ctx, {
 *       sheetName: "Inventario",
 *       title: "Reporte de Inventario",
 *       theme: "corporate-blue",
 *       summary: [{ label: "Total", value: 1240, type: "primary" }],
 *     });
 *     const { lastDataRow } = createTableSection(ws, columns, rows, tableHeaderRow, styles);
 *     createFooter(ws, ctx, lastDataRow, columns.length, "Reporte de Inventario", styles);
 *     return finalizeBuffer(workbook);
 *   }
 */
import ExcelJS from "exceljs";
import { createStyleSet, type StyleSet } from "./styles";
import { registerLogoInWorkbook } from "./images";
import { applyBrandHeader, applyFreezePane } from "./layout";
import type { LayoutContext } from "./layout";
import { applyTableHeader, applyTableBody, applyAutoFilter, type ReportColumn, type ReportRow } from "./tables";
import { renderSummaryCards, type SummaryCard } from "./summary";
import { renderCorporateFooter } from "./footer";
import { configurePrint } from "./print";
import { resolveTheme, type ThemeId, type ExcelTheme } from "../themes/index";
import type { ExcelReportContext } from "./workbook";

// ── Tipos de configuración ─────────────────────────────────────────────────

export type WorksheetSetupOptions = {
  sheetName: string;
  title: string;
  description?: string;
  theme?: ThemeId | ExcelTheme;
  summary?: SummaryCard[];
  tabColor?: string;
};

export type WorksheetSetupResult = {
  workbook: ExcelJS.Workbook;
  ws: ExcelJS.Worksheet;
  styles: StyleSet;
  /** Fila donde debe comenzar el header de la tabla */
  tableHeaderRow: number;
  logoId?: number;
};

export type TableSectionResult = {
  /** Fila del header de columnas */
  headerRow: number;
  /** Primera fila de datos */
  firstDataRow: number;
  /** Última fila de datos */
  lastDataRow: number;
};

// ── Helpers de composición ─────────────────────────────────────────────────

/**
 * Crea un workbook y una hoja con header corporativo y, opcionalmente, summary cards.
 * Retorna el workbook, la hoja, el StyleSet del tema y la fila de inicio de la tabla.
 *
 * El caller es responsable de llamar `createTableSection` y luego `finalizeBuffer`.
 */
export async function createWorksheetWithHeader(
  ctx: ExcelReportContext,
  opts: WorksheetSetupOptions
): Promise<WorksheetSetupResult> {
  const theme = resolveTheme(opts.theme);
  const styles = createStyleSet(theme);

  const wb = new ExcelJS.Workbook();
  wb.creator = ctx.exporterEmail ?? "MultiStock";
  wb.company = ctx.businessName;
  wb.created = ctx.exportedAt;
  wb.modified = ctx.exportedAt;

  const logoId = await registerLogoInWorkbook(wb);

  const ws = wb.addWorksheet(opts.sheetName, {
    properties: {
      tabColor: opts.tabColor
        ? { argb: opts.tabColor }
        : { argb: theme.colors.headerBg },
    },
  });

  // tableHeaderRow = 0 porque se necesita el colCount (que viene de las columnas).
  // Llamar applySheetHeader() a continuación con el colCount real.
  return { workbook: wb, ws, styles, tableHeaderRow: 0, logoId };
}

/**
 * Aplica el header corporativo y las summary cards a una hoja existente.
 * Devuelve la fila donde debe comenzar el header de tabla.
 *
 * Llamar ANTES de createTableSection.
 */
export function applySheetHeader(
  ws: ExcelJS.Worksheet,
  ctx: ExcelReportContext,
  colCount: number,
  opts: {
    title: string;
    description?: string;
    summary?: SummaryCard[];
  },
  styles: StyleSet,
  logoId?: number
): number {
  const layoutCtx: LayoutContext = {
    reportTitle: opts.title,
    reportDescription: opts.description,
    businessName: ctx.businessName,
    businessTypeLabel: ctx.businessTypeLabel,
    exportedAt: ctx.exportedAt,
  };

  let nextRow = applyBrandHeader(ws, layoutCtx, colCount, logoId, styles);

  if (opts.summary && opts.summary.length > 0) {
    nextRow = renderSummaryCards(ws, opts.summary, nextRow, colCount, styles);
  }

  return nextRow;
}

/**
 * Renderiza el header y el cuerpo de la tabla, aplica freeze y autofilter.
 * Retorna las filas de interés para el caller.
 */
export function createTableSection(
  ws: ExcelJS.Worksheet,
  columns: ReportColumn[],
  rows: ReportRow[],
  tableHeaderRow: number,
  styles: StyleSet,
  conditionalRules?: import("./conditional").ConditionalRule[]
): TableSectionResult {
  applyTableHeader(ws, columns, tableHeaderRow, styles);

  const firstDataRow = tableHeaderRow + 1;
  const lastDataRow =
    rows.length > 0
      ? applyTableBody(ws, columns, rows, firstDataRow, styles, conditionalRules)
      : firstDataRow - 1;

  applyFreezePane(ws, tableHeaderRow);

  if (rows.length > 0) {
    applyAutoFilter(ws, tableHeaderRow, lastDataRow, columns.length);
  }

  return { headerRow: tableHeaderRow, firstDataRow, lastDataRow };
}

/**
 * Renderiza el footer corporativo y configura la impresión.
 * Llamar DESPUÉS de createTableSection.
 */
export function createFooter(
  ws: ExcelJS.Worksheet,
  ctx: ExcelReportContext,
  lastDataRow: number,
  colCount: number,
  reportTitle: string,
  styles: StyleSet,
  tableHeaderRow?: number
): void {
  renderCorporateFooter(ws, ctx, lastDataRow + 1, colCount, reportTitle, styles);

  configurePrint(
    ws,
    {
      orientation: "landscape",
      paper: "A4",
      fitToPage: true,
      fitToWidth: 1,
      repeatHeaderRow: tableHeaderRow,
    },
    { reportTitle, businessName: ctx.businessName }
  );
}

/**
 * Serializa el workbook a Buffer.
 * Compatible con Next.js API routes.
 */
export async function finalizeBuffer(workbook: ExcelJS.Workbook): Promise<Buffer> {
  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Aplica un tema a una hoja de cálculo y retorna el StyleSet.
 * Establece el color de la pestaña según el tema.
 */
export function applyTheme(
  ws: ExcelJS.Worksheet,
  theme: ThemeId | ExcelTheme
): StyleSet {
  const t = resolveTheme(theme);
  ws.properties.tabColor = { argb: t.colors.headerBg };
  return createStyleSet(t);
}
