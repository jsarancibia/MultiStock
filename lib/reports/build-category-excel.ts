import ExcelJS from "exceljs";
import { movementTypeLabel } from "@/lib/business/movement-type-labels";
import { loadExcelBrandLogo } from "@/lib/reports/excel-brand-logo";
import { categoryLabel, type ProductExportSource } from "@/lib/reports/export-queries";
import { inventarioEstadoCalculado, inventarioSolicitarEtiqueta } from "@/lib/reports/inventory-stock-status";
import { paymentMethodLabels } from "@/lib/validations/sale";

export const exportReportKeys = ["productos", "inventario", "movimientos", "ventas", "alertas"] as const;
export type ExportReportKey = (typeof exportReportKeys)[number];

export type ExportWorkbookContext = {
  businessId: string;
  businessName: string;
  businessTypeLabel: string;
  exportedAt: Date;
  exporterEmail?: string | null;
};

type ExportSourceSubset = {
  products: ProductExportSource[];
  inventoryProducts: ProductExportSource[];
  movements: Array<{ created_at: string; type: string; quantity: string | number | null; reason: string | null }>;
  sales: Array<{ created_at: string; total: string | number | null; payment_method: string | null }>;
  alerts: Array<{ created_at: string; type: string; message: string | null; resolved: boolean | null }>;
};

type ReportColumn = {
  header: string;
  key: string;
  width: number;
  align?: "left" | "center" | "right";
  numFmt?: string;
};

type ReportDefinition = {
  key: ExportReportKey;
  fileLabel: string;
  sheetName: string;
  title: string;
  subtitle: string;
  listLabel: string;
  columns: ReportColumn[];
  rows: Array<Record<string, string | number | Date | null>>;
  summary: Array<[string, string | number]>;
  tabColor: string;
  specialLastHeader?: boolean;
};

/** Azul sobrio (menos “neón” que el cian brillante) — buena lectura con texto blanco */
const HEADER_BLUE = "FF1F5582";
const HEADER_DARK = "FF163E5C";
const HEADER_GRAY = "FFD9E2EA";
const STRIPE_GRAY = "FFF2F2F2";
const SUMMARY_FILL = "FFF8F9FA";
const WHITE = "FFFFFFFF";

export function isExportReportKey(value: string): value is ExportReportKey {
  return exportReportKeys.includes(value as ExportReportKey);
}

function n(value: unknown): number {
  const num = typeof value === "string" ? Number(value) : Number(value);
  return Number.isFinite(num) ? num : NaN;
}

function parseDate(value: string): Date {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

function humanDate(value: Date): string {
  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

/** Fecha/hora local en forma ISO-friendly (YYYY-MM-DD HH:mm) para trazabilidad y ETL. */
function isoLocalDateTime(value: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())} ${pad(value.getHours())}:${pad(value.getMinutes())}`;
}

function productCode(row: Pick<ProductExportSource, "sku" | "barcode">): string {
  const sku = typeof row.sku === "string" ? row.sku.trim() : "";
  if (sku) return sku;
  const barcode = typeof row.barcode === "string" ? row.barcode.trim() : "";
  if (barcode) return barcode;
  return "—";
}

function unitLabel(unitType: string): string {
  const unit = unitType.trim();
  if (!unit) return "—";
  if (unit === "unit") return "Und";
  if (unit.length <= 4) return unit.charAt(0).toUpperCase() + unit.slice(1).toLowerCase();
  return unit.toUpperCase();
}

function paymentMethodLabel(value: string | null): string {
  if (value && value in paymentMethodLabels) {
    return paymentMethodLabels[value as keyof typeof paymentMethodLabels];
  }
  return value ?? "—";
}

function buildReportDefinition(key: ExportReportKey, source: ExportSourceSubset, ctx: ExportWorkbookContext): ReportDefinition {
  if (key === "productos") {
    const rows = source.products.map((p) => ({
      codigo: productCode(p),
      descripcion: p.name,
      unidad: unitLabel(p.unit_type),
      categoria: categoryLabel(p),
      precio: n(p.sale_price),
      estado: p.active ? "Activo" : "Inactivo",
    }));

    return {
      key,
      fileLabel: "productos",
      sheetName: "Productos",
      title: "Lista de Productos",
      subtitle: `${ctx.businessName} · ${ctx.businessTypeLabel}`,
      listLabel: "Catálogo de productos",
      tabColor: "FF548235",
      columns: [
        { header: "CÓDIGO", key: "codigo", width: 16, align: "center" },
        { header: "DESCRIPCIÓN", key: "descripcion", width: 42 },
        { header: "UdM", key: "unidad", width: 9, align: "center" },
        { header: "CATEGORÍA", key: "categoria", width: 20, align: "center" },
        { header: "PRECIO", key: "precio", width: 14, align: "right", numFmt: '"$"#,##0' },
        { header: "ESTADO", key: "estado", width: 14, align: "center" },
      ],
      rows,
      summary: [["Total productos", rows.length]],
    };
  }

  if (key === "inventario") {
    let ok = 0;
    let bajo = 0;
    let critico = 0;
    const rows = source.inventoryProducts.map((p) => {
      const current = n(p.current_stock);
      const min = n(p.min_stock);
      const estado = inventarioEstadoCalculado(current, min);
      if (estado === "OK") ok += 1;
      if (estado === "Stock bajo") bajo += 1;
      if (estado === "Stock crítico") critico += 1;
      return {
        codigo: productCode(p),
        descripcion: p.name,
        unidad: unitLabel(p.unit_type),
        categoria: categoryLabel(p),
        almacen: ctx.businessName,
        stock_minimo: Number.isFinite(min) ? min : null,
        inventario: Number.isFinite(current) ? current : null,
        estado,
        solicitar: inventarioSolicitarEtiqueta(current, min),
      };
    });

    return {
      key,
      fileLabel: "inventario",
      sheetName: "Inventario",
      title: "Control de Inventario",
      subtitle: `${ctx.businessName} · ${ctx.businessTypeLabel}`,
      listLabel: "Lista de Materiales",
      tabColor: "FF00A6D6",
      specialLastHeader: true,
      columns: [
        { header: "CÓDIGO", key: "codigo", width: 14, align: "center" },
        { header: "DESCRIPCIÓN", key: "descripcion", width: 36 },
        { header: "UdM", key: "unidad", width: 9, align: "center" },
        { header: "CATEGORÍA", key: "categoria", width: 18, align: "center" },
        { header: "ALMACÉN", key: "almacen", width: 22, align: "center" },
        { header: "STOCK MÍNIMO", key: "stock_minimo", width: 15, align: "right", numFmt: "#,##0.####" },
        { header: "INVENTARIO", key: "inventario", width: 14, align: "right", numFmt: "#,##0.####" },
        { header: "ESTADO", key: "estado", width: 16, align: "center" },
        { header: "SOLICITAR", key: "solicitar", width: 22, align: "center" },
      ],
      rows,
      summary: [
        ["Total productos", rows.length],
        ["OK", ok],
        ["Stock bajo", bajo],
        ["Stock crítico", critico],
      ],
    };
  }

  if (key === "movimientos") {
    const rows = source.movements.map((m) => ({
      fecha: parseDate(m.created_at),
      tipo: movementTypeLabel(m.type),
      cantidad: n(m.quantity),
      motivo: m.reason ?? "—",
    }));

    return {
      key,
      fileLabel: "movimientos",
      sheetName: "Movimientos",
      title: "Movimientos de Stock",
      subtitle: `${ctx.businessName} · ${ctx.businessTypeLabel}`,
      listLabel: "Registro de movimientos",
      tabColor: "FFFFC000",
      columns: [
        { header: "FECHA", key: "fecha", width: 22, numFmt: "dd/mm/yyyy hh:mm" },
        { header: "TIPO", key: "tipo", width: 20 },
        { header: "CANTIDAD", key: "cantidad", width: 14, align: "right", numFmt: "#,##0.####" },
        { header: "MOTIVO", key: "motivo", width: 56 },
      ],
      rows,
      summary: [["Total movimientos", rows.length]],
    };
  }

  if (key === "ventas") {
    let total = 0;
    const rows = source.sales.map((s) => {
      const saleTotal = n(s.total);
      if (Number.isFinite(saleTotal)) total += saleTotal;
      return {
        fecha: parseDate(s.created_at),
        total: saleTotal,
        metodo_pago: paymentMethodLabel(s.payment_method),
      };
    });

    return {
      key,
      fileLabel: "ventas",
      sheetName: "Ventas",
      title: "Reporte de Ventas",
      subtitle: `${ctx.businessName} · ${ctx.businessTypeLabel}`,
      listLabel: "Ventas registradas",
      tabColor: "FF9DC3E6",
      columns: [
        { header: "FECHA", key: "fecha", width: 22, numFmt: "dd/mm/yyyy hh:mm" },
        { header: "TOTAL", key: "total", width: 16, align: "right", numFmt: '"$"#,##0' },
        { header: "MÉTODO DE PAGO", key: "metodo_pago", width: 22 },
      ],
      rows,
      summary: [
        ["Total ventas", rows.length],
        ["Monto total", total],
      ],
    };
  }

  const pendientes = source.alerts.filter((a) => !a.resolved).length;
  const rows = source.alerts.map((a) => ({
    fecha: parseDate(a.created_at),
    tipo: a.type,
    mensaje: a.message ?? "—",
    estado: a.resolved ? "Resuelta" : "Pendiente",
  }));

  return {
    key,
    fileLabel: "alertas",
    sheetName: "Alertas",
    title: "Reporte de Alertas",
    subtitle: `${ctx.businessName} · ${ctx.businessTypeLabel}`,
    listLabel: "Alertas operativas",
    tabColor: "FFC65911",
    columns: [
      { header: "FECHA", key: "fecha", width: 22, numFmt: "dd/mm/yyyy hh:mm" },
      { header: "TIPO", key: "tipo", width: 20 },
      { header: "MENSAJE", key: "mensaje", width: 58 },
      { header: "ESTADO", key: "estado", width: 14, align: "center" },
    ],
    rows,
    summary: [
      ["Total alertas", rows.length],
      ["Pendientes", pendientes],
      ["Resueltas", rows.length - pendientes],
    ],
  };
}

function addLogo(workbook: ExcelJS.Workbook): number | undefined {
  const logoAsset = loadExcelBrandLogo();
  if (!logoAsset) return undefined;
  return workbook.addImage({
    // exceljs aún no refleja bien los tipos de Buffer con Node 22+.
    buffer: logoAsset.buffer as never,
    extension: logoAsset.extension,
  });
}

function applyTopLayout(ws: ExcelJS.Worksheet, report: ReportDefinition, ctx: ExportWorkbookContext, logoId?: number) {
  const endCol = report.columns.length;
  ws.properties.defaultRowHeight = 18;
  ws.views = [{ state: "frozen", ySplit: 9, showGridLines: false }];

  // Fila 1: Banda superior "MultiStock"
  ws.mergeCells(1, 1, 1, endCol);
  const top = ws.getCell(1, 1);
  top.value = "MultiStock";
  top.font = { bold: true, size: 13, color: { argb: "FF222222" } };
  top.alignment = { horizontal: "center", vertical: "middle" };
  top.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD9D9D9" } };
  ws.getRow(1).height = 20;

  // Filas 2-3: Marca (compacto; una fila menos que antes)
  ws.mergeCells(2, 1, 3, endCol);
  const brand = ws.getCell(2, 1);
  brand.value = "MultiStock";
  brand.font = { bold: true, italic: true, size: 17, color: { argb: "FF888888" } };
  brand.alignment = { horizontal: "center", vertical: "middle" };
  brand.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF5F5F5" } };
  ws.getRow(2).height = 22;
  ws.getRow(3).height = 22;

  if (logoId != null) {
    ws.addImage(logoId, { tl: { col: 0.15, row: 1.05 }, ext: { width: 88, height: 50 } });
  }

  // Fila 4: Separador delgado
  ws.getRow(4).height = 6;

  // Fila 5: Título (cols 1..midCol) + negocio/tipo (cols midCol+1..endCol)
  const midCol = Math.max(2, Math.ceil(endCol * 0.58));
  ws.mergeCells(5, 1, 5, midCol);
  const titleCell = ws.getCell(5, 1);
  titleCell.value = report.title;
  titleCell.font = { bold: true, size: 15 };
  titleCell.alignment = { horizontal: "left", vertical: "middle" };
  ws.getRow(5).height = 24;

  if (midCol < endCol) {
    ws.mergeCells(5, midCol + 1, 5, endCol);
    const meta = ws.getCell(5, midCol + 1);
    meta.value = `${ctx.businessName} · ${ctx.businessTypeLabel}`;
    meta.font = { size: 10, color: { argb: "FF595959" } };
    meta.alignment = { horizontal: "right", vertical: "middle" };
  }

  // Fila 6: Alcance del listado (listLabel)
  ws.mergeCells(6, 1, 6, endCol);
  const listCell = ws.getCell(6, 1);
  listCell.value = report.listLabel;
  listCell.font = { italic: true, size: 10, color: { argb: "FF595959" } };
  listCell.alignment = { horizontal: "left", vertical: "middle" };

  // Fila 7: Exportación — legible local + sello ISO para automatización
  ws.mergeCells(7, 1, 7, endCol);
  const exportCell = ws.getCell(7, 1);
  const isoLine = isoLocalDateTime(ctx.exportedAt);
  const exportBits = [
    `Exportado: ${humanDate(ctx.exportedAt)}`,
    `ISO ${isoLine}`,
    ctx.exporterEmail ? `Por: ${ctx.exporterEmail}` : null,
  ].filter(Boolean);
  exportCell.value = exportBits.join("  ·  ");
  exportCell.font = { size: 9, color: { argb: "FF666666" } };
  exportCell.alignment = { horizontal: "left", vertical: "middle", wrapText: true };
  ws.getRow(7).height = ctx.exporterEmail ? 30 : 22;

  // Fila 8: vacía mínima — separa metadatos de la tabla (cabecera fila 9)
  ws.getRow(8).height = 6;
}

function applyHeaderRow(ws: ExcelJS.Worksheet, report: ReportDefinition, rowNumber: number) {
  const row = ws.getRow(rowNumber);
  report.columns.forEach((column, index) => {
    const cell = row.getCell(index + 1);
    const special = Boolean(report.specialLastHeader && index === report.columns.length - 1);
    cell.value = column.header;
    cell.font = { bold: true, size: 10, color: { argb: special ? "FF000000" : WHITE } };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: special ? HEADER_GRAY : HEADER_BLUE },
    };
    cell.border = {
      top: { style: "thin", color: { argb: HEADER_DARK } },
      left: { style: "thin", color: { argb: HEADER_DARK } },
      bottom: { style: "thin", color: { argb: HEADER_DARK } },
      right: { style: "thin", color: { argb: HEADER_DARK } },
    };
  });
  // Altura extra para que texto + icono de filtro no choquen
  row.height = 27;
}

function applyBodyRowStyle(row: ExcelJS.Row, rowIndex: number, report: ReportDefinition) {
  const useStripe = rowIndex % 2 === 1;
  report.columns.forEach((column, index) => {
    const cell = row.getCell(index + 1);
    cell.alignment = {
      horizontal: column.align ?? "left",
      vertical: "middle",
      wrapText: column.key === "mensaje" || column.key === "motivo",
    };
    if (column.numFmt) cell.numFmt = column.numFmt;
    if (useStripe) {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: STRIPE_GRAY } };
    }
    cell.border = {
      top: { style: "thin", color: { argb: "FFD9D9D9" } },
      bottom: { style: "thin", color: { argb: "FFD9D9D9" } },
    };
  });
}

function applyCategoryHighlights(ws: ExcelJS.Worksheet, report: ReportDefinition, startRow: number) {
  if (!report.rows.length) return;

  for (let i = 0; i < report.rows.length; i += 1) {
    const rowNumber = startRow + i;

    if (report.key === "inventario") {
      const estado = String(ws.getCell(rowNumber, 8).value ?? "");
      const solicitar = String(ws.getCell(rowNumber, 9).value ?? "");
      const estadoCell = ws.getCell(rowNumber, 8);
      const solicitarCell = ws.getCell(rowNumber, 9);

      if (estado === "OK") estadoCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFC6EFCE" } };
      if (estado.includes("bajo")) estadoCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFF2CC" } };
      if (estado.includes("crítico") || estado.includes("Crítico")) {
        estadoCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFC7CE" } };
      }

      solicitarCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: solicitar.includes("Solicitar") ? "FFFFF2CC" : "FFC6EFCE" },
      };
    }

    if (report.key === "alertas") {
      const estado = String(ws.getCell(rowNumber, 4).value ?? "");
      ws.getCell(rowNumber, 4).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: estado === "Pendiente" ? "FFFFF2CC" : "FFC6EFCE" },
      };
    }
  }
}

function addSummary(ws: ExcelJS.Worksheet, report: ReportDefinition, startRow: number) {
  const endCol = report.columns.length;
  const summaryRow = startRow + report.rows.length + 2;
  const edge = { argb: "FFCCD6E0" };

  const titleMergeEnd = Math.min(4, endCol);
  ws.mergeCells(summaryRow, 1, summaryRow, titleMergeEnd);
  const titleCell = ws.getCell(summaryRow, 1);
  titleCell.value = "RESUMEN";
  titleCell.font = { bold: true, size: 11, color: { argb: "FF1F5582" } };
  titleCell.alignment = { horizontal: "left", vertical: "middle" };
  titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: SUMMARY_FILL } };
  titleCell.border = {
    top: { style: "thin", color: edge },
    bottom: { style: "thin", color: edge },
  };
  ws.getRow(summaryRow).height = 20;

  report.summary.forEach(([label, value], idx) => {
    const rowNumber = summaryRow + idx + 1;
    const labelCell = ws.getCell(rowNumber, 1);
    const valueCell = ws.getCell(rowNumber, 2);

    labelCell.value = label;
    labelCell.font = { bold: true, size: 10 };
    labelCell.alignment = { horizontal: "left", vertical: "middle" };
    labelCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: SUMMARY_FILL } };

    valueCell.value = value;
    valueCell.font = { size: 10 };
    valueCell.alignment = { horizontal: "right", vertical: "middle" };
    valueCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: WHITE } };

    const box = {
      top: { style: "thin" as const, color: edge },
      left: { style: "thin" as const, color: edge },
      bottom: { style: "thin" as const, color: edge },
      right: { style: "thin" as const, color: edge },
    };
    labelCell.border = box;
    valueCell.border = box;

    if (report.key === "ventas" && String(label).toLowerCase().includes("monto")) {
      valueCell.numFmt = '"$"#,##0';
    }
  });

  // Ancho mínimo de la columna de valores del resumen (siempre columna B)
  const colB = ws.getColumn(2);
  colB.width = Math.max(Number(colB.width) || 0, 14);
}

function excelCellValue(value: string | number | Date | null | undefined): string | number | Date {
  if (value instanceof Date) return value;
  if (typeof value === "number") return Number.isFinite(value) ? value : "—";
  return value ?? "—";
}

export async function buildCategoryExcelBuffer(opts: {
  reportKey: ExportReportKey;
  context: ExportWorkbookContext;
  source: ExportSourceSubset;
}): Promise<Buffer> {
  const { reportKey, context, source } = opts;
  const report = buildReportDefinition(reportKey, source, context);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "MultiStock";
  workbook.company = context.businessName;
  workbook.created = context.exportedAt;
  workbook.modified = context.exportedAt;
  workbook.title = `MultiStock · ${report.title}`;
  workbook.description = `${report.title} · ${context.businessName}`;

  const logoId = addLogo(workbook);
  const ws = workbook.addWorksheet(report.sheetName, {
    properties: { tabColor: { argb: report.tabColor } },
    pageSetup: {
      orientation: "landscape",
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      paperSize: 9,
      showGridLines: false,
    },
  });

  applyTopLayout(ws, report, context, logoId);
  applyHeaderRow(ws, report, 9);

  const dataStart = 10;
  report.rows.forEach((data, index) => {
    const row = ws.getRow(dataStart + index);
    report.columns.forEach((column, colIndex) => {
      row.getCell(colIndex + 1).value = excelCellValue(data[column.key]);
    });
    applyBodyRowStyle(row, index, report);
  });

  if (report.rows.length) {
    ws.autoFilter = {
      from: { row: 9, column: 1 },
      to: { row: 9 + report.rows.length, column: report.columns.length },
    };
  }

  applyCategoryHighlights(ws, report, dataStart);
  addSummary(ws, report, dataStart);

  ws.columns = report.columns.map((column) => ({ width: column.width }));
  ws.eachRow((row) => {
    row.eachCell((cell) => {
      cell.font = cell.font ?? { size: 10 };
    });
  });

  const raw = await workbook.xlsx.writeBuffer();
  return Buffer.from(raw);
}

export function reportFileLabel(key: ExportReportKey): string {
  return buildReportDefinition(key, {
    products: [],
    inventoryProducts: [],
    movements: [],
    sales: [],
    alerts: [],
  }, {
    businessId: "",
    businessName: "",
    businessTypeLabel: "",
    exportedAt: new Date(0),
  }).fileLabel;
}
