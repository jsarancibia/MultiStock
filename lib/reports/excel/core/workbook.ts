/**
 * Motor principal del sistema de reportes Excel.
 *
 * Responsabilidades:
 * - Crear el workbook con propiedades corporativas
 * - Orquestar el renderizado: brand header → table header → table body → freeze pane → autofilter
 * - Registrar el logo una sola vez por workbook
 * - Serializar a Buffer para uso en API routes de Next.js
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
 *     columns: [...],
 *     rows: rows.map((r) => ({ sku: r.sku, name: r.name, ... })),
 *   });
 * }
 * ─────────────────────────────────────────────────────────────────────
 */
import ExcelJS from "exceljs";
import { registerLogoInWorkbook } from "./images";
import { applyBrandHeader, applyFreezePane, type LayoutContext } from "./layout";
import { applyTableHeader, applyTableBody, applyAutoFilter } from "./tables";
import type { ReportColumn, ReportRow } from "./tables";

// ── Tipos públicos ─────────────────────────────────────────────────────────

export type { ReportColumn, ReportRow };

/**
 * Contexto del negocio para generar el header corporativo.
 * Se obtiene desde los datos de la sesión o del negocio en la DB.
 */
export type ExcelReportContext = {
  /** ID del negocio (para referencia/auditoría) */
  businessId: string;
  /** Nombre del negocio mostrado en el header */
  businessName: string;
  /** Tipo de negocio (ej. "Almacén", "Tienda", "Distribuidora") */
  businessTypeLabel: string;
  /** Fecha y hora de exportación */
  exportedAt: Date;
  /** Email del usuario que exporta (opcional, para auditoría) */
  exporterEmail?: string | null;
};

/**
 * Opciones para generar una hoja de datos dentro del workbook.
 */
export type ReportSheetOptions = {
  /** Nombre de la pestaña en Excel */
  sheetName: string;
  /** Título grande mostrado en el header corporativo */
  title: string;
  /** Descripción corta (opcional) — aparece bajo el título */
  description?: string;
  /** Color de la pestaña en formato ARGB (ej. "FF2E7C51") */
  tabColor?: string;
  /** Definición de columnas */
  columns: ReportColumn[];
  /** Filas de datos */
  rows: ReportRow[];
};

// ── Builder principal ──────────────────────────────────────────────────────

/**
 * Genera un Buffer de Excel listo para descargar a partir de un contexto y
 * una configuración de hoja de datos.
 *
 * Es la función de alto nivel que deben llamar los generators.
 * Internamente coordina: workbook → logo → brand header → tabla → freeze → autofilter.
 */
export async function buildReportBuffer(
  ctx: ExcelReportContext,
  sheet: ReportSheetOptions
): Promise<Buffer> {
  const workbook = createWorkbook(ctx);

  // Logo registrado una sola vez en el workbook
  const logoId = await registerLogoInWorkbook(workbook);

  // Agregar la hoja principal de datos
  await addDataSheet(workbook, ctx, sheet, logoId);

  return serializeWorkbook(workbook);
}

/**
 * Versión multi-hoja: permite agregar múltiples ReportSheetOptions.
 * Útil para reportes con resumen + detalle, o múltiples categorías.
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

/**
 * Crea un workbook con propiedades corporativas.
 * Define autor, empresa y fecha de creación para los metadatos del archivo.
 */
function createWorkbook(ctx: ExcelReportContext): ExcelJS.Workbook {
  const wb = new ExcelJS.Workbook();
  wb.creator = ctx.exporterEmail ?? "MultiStock";
  wb.company = ctx.businessName;
  wb.created = ctx.exportedAt;
  wb.modified = ctx.exportedAt;
  return wb;
}

/**
 * Agrega una hoja de datos al workbook con header corporativo y tabla completa.
 */
async function addDataSheet(
  workbook: ExcelJS.Workbook,
  ctx: ExcelReportContext,
  opts: ReportSheetOptions,
  logoId?: number
): Promise<void> {
  const ws = workbook.addWorksheet(opts.sheetName, {
    properties: { tabColor: opts.tabColor ? { argb: opts.tabColor } : undefined },
    pageSetup: {
      paperSize: 9, // A4
      orientation: "landscape",
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
    },
  });

  const colCount = opts.columns.length;

  // 1. Header corporativo (retorna la fila donde debe ir el header de tabla)
  const layoutCtx: LayoutContext = {
    reportTitle: opts.title,
    reportDescription: opts.description,
    businessName: ctx.businessName,
    businessTypeLabel: ctx.businessTypeLabel,
    exportedAt: ctx.exportedAt,
  };
  const tableHeaderRow = applyBrandHeader(ws, layoutCtx, colCount, logoId);

  // 2. Header de tabla (encabezados de columna con headerStyle)
  applyTableHeader(ws, opts.columns, tableHeaderRow);

  // 3. Datos (con alternancia y formatos)
  const firstDataRow = tableHeaderRow + 1;
  const lastDataRow =
    opts.rows.length > 0
      ? applyTableBody(ws, opts.columns, opts.rows, firstDataRow)
      : firstDataRow - 1;

  // 4. Panel congelado (header de tabla siempre visible)
  applyFreezePane(ws, tableHeaderRow);

  // 5. Autofilter sobre el rango de datos
  if (opts.rows.length > 0) {
    applyAutoFilter(ws, tableHeaderRow, lastDataRow, colCount);
  }
}

/**
 * Serializa el workbook a Buffer.
 * Compatible con Next.js API routes y con Node.js streams.
 */
async function serializeWorkbook(workbook: ExcelJS.Workbook): Promise<Buffer> {
  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}
