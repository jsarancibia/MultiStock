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
  columns: ReportColumn[];
  rows: Array<Record<string, string | number | Date | null>>;
  summary: Array<[string, number]>;
  tabColor: string;
};

// Paleta aproximada a la UI actual (primary/accent/border del tema claro).
const HEADER_BG = "FF2F7D57";
const HEADER_TEXT = "FFFFFFFF";
const TOP_BG = "FFF7FAF6";
const TOP_ACCENT = "FFEAF4ED";
const EDGE = "FFD9E7DD";
const STRIPE = "FFFCFEFD";
const KPI_BG = "FFEFF7F2";
const KPI_TEXT = "FF21553C";

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
      unidad_medida: unitLabel(p.unit_type),
      categoria: categoryLabel(p),
      precio_venta: n(p.sale_price),
      estado: p.active ? "Activo" : "Inactivo",
    }));
    return {
      key,
      fileLabel: "productos",
      sheetName: "Productos",
      title: "Reporte de Productos",
      tabColor: "FF548235",
      columns: [
        { header: "Código", key: "codigo", width: 16, align: "center" },
        { header: "Descripción", key: "descripcion", width: 42 },
        { header: "UdM", key: "unidad_medida", width: 10, align: "center" },
        { header: "Categoría", key: "categoria", width: 22, align: "center" },
        { header: "Precio venta", key: "precio_venta", width: 15, align: "right", numFmt: '"$"#,##0' },
        { header: "Estado", key: "estado", width: 14, align: "center" },
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
        unidad_medida: unitLabel(p.unit_type),
        categoria: categoryLabel(p),
        almacen: ctx.businessName,
        stock_minimo: Number.isFinite(min) ? min : null,
        stock_actual: Number.isFinite(current) ? current : null,
        estado_stock: estado,
        accion_sugerida: inventarioSolicitarEtiqueta(current, min),
      };
    });
    return {
      key,
      fileLabel: "inventario",
      sheetName: "Inventario",
      title: "Reporte de Inventario",
      tabColor: "FF00A6D6",
      columns: [
        { header: "Código", key: "codigo", width: 14, align: "center" },
        { header: "Descripción", key: "descripcion", width: 34 },
        { header: "UdM", key: "unidad_medida", width: 10, align: "center" },
        { header: "Categoría", key: "categoria", width: 18, align: "center" },
        { header: "Almacén", key: "almacen", width: 22, align: "center" },
        { header: "Stock mínimo", key: "stock_minimo", width: 15, align: "right", numFmt: "#,##0.####" },
        { header: "Stock actual", key: "stock_actual", width: 15, align: "right", numFmt: "#,##0.####" },
        { header: "Estado stock", key: "estado_stock", width: 16, align: "center" },
        { header: "Acción sugerida", key: "accion_sugerida", width: 22, align: "center" },
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
      fecha_hora: parseDate(m.created_at),
      tipo_movimiento: movementTypeLabel(m.type),
      cantidad: n(m.quantity),
      motivo: m.reason ?? "—",
    }));
    return {
      key,
      fileLabel: "movimientos",
      sheetName: "Movimientos",
      title: "Reporte de Movimientos",
      tabColor: "FFFFC000",
      columns: [
        { header: "Fecha y hora", key: "fecha_hora", width: 22, numFmt: "dd/mm/yyyy hh:mm" },
        { header: "Tipo movimiento", key: "tipo_movimiento", width: 22 },
        { header: "Cantidad", key: "cantidad", width: 14, align: "right", numFmt: "#,##0.####" },
        { header: "Motivo", key: "motivo", width: 56 },
      ],
      rows,
      summary: [["Total movimientos", rows.length]],
    };
  }

  if (key === "ventas") {
    let totalVentas = 0;
    const rows = source.sales.map((s) => {
      const total = n(s.total);
      if (Number.isFinite(total)) totalVentas += total;
      return {
        fecha_hora: parseDate(s.created_at),
        total_venta: total,
        metodo_pago: paymentMethodLabel(s.payment_method),
      };
    });
    return {
      key,
      fileLabel: "ventas",
      sheetName: "Ventas",
      title: "Reporte de Ventas",
      tabColor: "FF9DC3E6",
      columns: [
        { header: "Fecha y hora", key: "fecha_hora", width: 22, numFmt: "dd/mm/yyyy hh:mm" },
        { header: "Total venta", key: "total_venta", width: 16, align: "right", numFmt: '"$"#,##0' },
        { header: "Método de pago", key: "metodo_pago", width: 22 },
      ],
      rows,
      summary: [
        ["Total ventas", rows.length],
        ["Monto total", totalVentas],
      ],
    };
  }

  const pendientes = source.alerts.filter((a) => !a.resolved).length;
  const rows = source.alerts.map((a) => ({
    fecha_hora: parseDate(a.created_at),
    tipo_alerta: a.type,
    mensaje: a.message ?? "—",
    estado: a.resolved ? "Resuelta" : "Pendiente",
  }));
  return {
    key,
    fileLabel: "alertas",
    sheetName: "Alertas",
    title: "Reporte de Alertas",
    tabColor: "FFC65911",
    columns: [
      { header: "Fecha y hora", key: "fecha_hora", width: 22, numFmt: "dd/mm/yyyy hh:mm" },
      { header: "Tipo alerta", key: "tipo_alerta", width: 20 },
      { header: "Mensaje", key: "mensaje", width: 58 },
      { header: "Estado", key: "estado", width: 14, align: "center" },
    ],
    rows,
    summary: [
      ["Total alertas", rows.length],
      ["Pendientes", pendientes],
      ["Resueltas", rows.length - pendientes],
    ],
  };
}

function excelCellValue(value: string | number | Date | null | undefined): string | number | Date {
  if (value instanceof Date) return value;
  if (typeof value === "number") return Number.isFinite(value) ? value : "—";
  return value ?? "—";
}

function humanDate(value: Date): string {
  return new Intl.DateTimeFormat("es-CL", { dateStyle: "medium", timeStyle: "short" }).format(value);
}

function addLogo(workbook: ExcelJS.Workbook): number | undefined {
  const logo = loadExcelBrandLogo();
  if (!logo) return undefined;
  return workbook.addImage({
    buffer: logo.buffer as never,
    extension: logo.extension,
  });
}

function applyBrandTop(
  ws: ExcelJS.Worksheet,
  report: ReportDefinition,
  context: ExportWorkbookContext,
  dataHeaderRow: number,
  logoId?: number
) {
  const endCol = report.columns.length;
  ws.views = [{ state: "frozen", ySplit: dataHeaderRow, topLeftCell: `A${dataHeaderRow + 1}` }];

  ws.mergeCells(1, 1, 1, endCol);
  const brandCell = ws.getCell(1, 1);
  brandCell.value = "MultiStock";
  brandCell.font = { bold: true, size: 14, color: { argb: "FF1F3A2A" } };
  brandCell.alignment = { horizontal: "center", vertical: "middle" };
  brandCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: TOP_ACCENT } };
  ws.getRow(1).height = 24;

  ws.mergeCells(2, 1, 2, endCol);
  const titleCell = ws.getCell(2, 1);
  titleCell.value = report.title;
  titleCell.font = { bold: true, size: 16, color: { argb: "FF203628" } };
  titleCell.alignment = { horizontal: "left", vertical: "middle" };
  titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: TOP_BG } };
  ws.getRow(2).height = 28;

  ws.mergeCells(3, 1, 3, endCol);
  const metaCell = ws.getCell(3, 1);
  metaCell.value = `${context.businessName} · ${context.businessTypeLabel} · Exportado: ${humanDate(context.exportedAt)}`;
  metaCell.font = { size: 10, color: { argb: "FF4A5C51" } };
  metaCell.alignment = { horizontal: "left", vertical: "middle" };
  metaCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: TOP_BG } };
  ws.getRow(3).height = 20;

  ws.getRow(4).height = 8;
  for (let c = 1; c <= endCol; c += 1) {
    const cell = ws.getCell(4, c);
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: TOP_BG } };
  }

  if (logoId != null) {
    ws.addImage(logoId, {
      tl: { col: 0.1, row: 0.15 },
      ext: { width: 64, height: 40 },
    });
  }
}

function styleDataSheet(ws: ExcelJS.Worksheet, report: ReportDefinition, headerRowNumber: number) {
  const headerRow = ws.getRow(headerRowNumber);
  headerRow.height = 24;
  report.columns.forEach((_, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.font = { bold: true, color: { argb: HEADER_TEXT } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: HEADER_BG } };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = {
      top: { style: "thin", color: { argb: EDGE } },
      left: { style: "thin", color: { argb: EDGE } },
      bottom: { style: "thin", color: { argb: EDGE } },
      right: { style: "thin", color: { argb: EDGE } },
    };
  });

  for (let rowNum = headerRowNumber + 1; rowNum <= headerRowNumber + report.rows.length; rowNum += 1) {
    const row = ws.getRow(rowNum);
    const stripe = (rowNum - headerRowNumber) % 2 === 1;
    report.columns.forEach((column, i) => {
      const cell = row.getCell(i + 1);
      cell.alignment = { horizontal: column.align ?? "left", vertical: "middle", wrapText: column.key === "mensaje" || column.key === "motivo" };
      if (column.numFmt) cell.numFmt = column.numFmt;
      if (stripe) {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: STRIPE } };
      }
      cell.border = {
        top: { style: "thin", color: { argb: EDGE } },
        bottom: { style: "thin", color: { argb: EDGE } },
        left: { style: "thin", color: { argb: EDGE } },
        right: { style: "thin", color: { argb: EDGE } },
      };
    });
  }
}

function addSummarySheet(workbook: ExcelJS.Workbook, report: ReportDefinition, context: ExportWorkbookContext, logoId?: number) {
  const ws = workbook.addWorksheet("Resumen", {
    properties: { tabColor: { argb: report.tabColor } },
  });
  ws.columns = [
    { header: "Métrica", key: "metrica", width: 30 },
    { header: "Valor", key: "valor", width: 18 },
  ];

  ws.insertRow(1, []);
  ws.insertRow(2, []);
  ws.mergeCells(1, 1, 1, 2);
  const title = ws.getCell(1, 1);
  title.value = `Resumen · ${report.title}`;
  title.font = { bold: true, size: 14, color: { argb: "FF1F3A2A" } };
  title.alignment = { horizontal: "left", vertical: "middle" };
  title.fill = { type: "pattern", pattern: "solid", fgColor: { argb: TOP_ACCENT } };
  ws.getRow(1).height = 24;

  ws.mergeCells(2, 1, 2, 2);
  const meta = ws.getCell(2, 1);
  meta.value = `${context.businessName} · Exportado: ${humanDate(context.exportedAt)}`;
  meta.font = { size: 10, color: { argb: "FF4A5C51" } };
  meta.alignment = { horizontal: "left", vertical: "middle" };
  meta.fill = { type: "pattern", pattern: "solid", fgColor: { argb: TOP_BG } };

  if (logoId != null) {
    ws.addImage(logoId, {
      tl: { col: 0.1, row: 0.15 },
      ext: { width: 60, height: 38 },
    });
  }

  const tableHeaderRow = ws.getRow(3);
  tableHeaderRow.height = 22;
  [1, 2].forEach((i) => {
    const cell = tableHeaderRow.getCell(i);
    cell.font = { bold: true, color: { argb: HEADER_TEXT } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: HEADER_BG } };
    cell.alignment = { horizontal: i === 1 ? "left" : "right", vertical: "middle" };
    cell.border = {
      top: { style: "thin", color: { argb: EDGE } },
      left: { style: "thin", color: { argb: EDGE } },
      bottom: { style: "thin", color: { argb: EDGE } },
      right: { style: "thin", color: { argb: EDGE } },
    };
  });

  report.summary.forEach(([metrica, valor], idx) => {
    const row = ws.addRow({ metrica, valor });
    const rowNum = idx + 4;
    const stripe = rowNum % 2 === 0;
    const metricCell = row.getCell(1);
    const valueCell = row.getCell(2);
    metricCell.font = { bold: true };
    metricCell.alignment = { horizontal: "left", vertical: "middle" };
    valueCell.alignment = { horizontal: "right", vertical: "middle" };
    valueCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: KPI_BG } };
    valueCell.font = { bold: true, color: { argb: KPI_TEXT } };
    if (report.key === "ventas" && metrica.toLowerCase().includes("monto")) {
      valueCell.numFmt = '"$"#,##0';
    }
    if (stripe) {
      metricCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: STRIPE } };
      valueCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: STRIPE } };
    }
    metricCell.border = {
      top: { style: "thin", color: { argb: EDGE } },
      bottom: { style: "thin", color: { argb: EDGE } },
      left: { style: "thin", color: { argb: EDGE } },
      right: { style: "thin", color: { argb: EDGE } },
    };
    valueCell.border = {
      top: { style: "thin", color: { argb: EDGE } },
      bottom: { style: "thin", color: { argb: EDGE } },
      left: { style: "thin", color: { argb: EDGE } },
      right: { style: "thin", color: { argb: EDGE } },
    };
  });
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
  workbook.title = report.title;
  workbook.description = `${report.title} · ${context.businessName}`;
  const logoId = addLogo(workbook);

  const dataSheet = workbook.addWorksheet(report.sheetName, {
    properties: { tabColor: { argb: report.tabColor } },
    pageSetup: { orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 0, paperSize: 9 },
  });
  const dataHeaderRow = 5;
  applyBrandTop(dataSheet, report, context, dataHeaderRow, logoId);

  dataSheet.columns = report.columns.map((column) => ({
    header: column.header,
    key: column.key,
    width: column.width,
  }));

  report.rows.forEach((data) => {
    const rowValues: Record<string, string | number | Date> = {};
    report.columns.forEach((column) => {
      rowValues[column.key] = excelCellValue(data[column.key]);
    });
    dataSheet.addRow(rowValues);
  });

  if (report.rows.length > 0) {
    dataSheet.autoFilter = {
      from: { row: dataHeaderRow, column: 1 },
      to: { row: dataHeaderRow + report.rows.length, column: report.columns.length },
    };
  }

  styleDataSheet(dataSheet, report, dataHeaderRow);
  addSummarySheet(workbook, report, context, logoId);

  const raw = await workbook.xlsx.writeBuffer();
  return Buffer.from(raw);
}

export function reportFileLabel(key: ExportReportKey): string {
  return buildReportDefinition(
    key,
    {
      products: [],
      inventoryProducts: [],
      movements: [],
      sales: [],
      alerts: [],
    },
    {
      businessId: "",
      businessName: "",
      businessTypeLabel: "",
      exportedAt: new Date(0),
    }
  ).fileLabel;
}
