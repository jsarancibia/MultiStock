import ExcelJS from "exceljs";
import { movementTypeLabel } from "@/lib/business/movement-type-labels";
import { loadExcelBrandLogo } from "@/lib/reports/excel-brand-logo";
import { categoryLabel, type ProductExportSource } from "@/lib/reports/export-queries";
import { inventarioEstadoCalculado, inventarioSolicitarEtiqueta } from "@/lib/reports/inventory-stock-status";
import { paymentMethodLabels } from "@/lib/validations/sale";

const HEADER_BLUE = "FF4472C4";
const WHITE = "FFFFFFFF";
const STRIPE_GRAY = "FFF2F2F2";
const HEADER_GRAY = "FFD9D9D9";

export type MultistockExportWorkbookContext = {
  /** Identifica el tenant; la plantilla de columnas es la misma para todos. */
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

function num(v: unknown): number {
  const n = typeof v === "string" ? Number(v) : Number(v);
  return Number.isFinite(n) ? n : NaN;
}

function parseExcelDate(iso: string): Date {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

function formatoFechaHumanaLocal(d: Date): string {
  return new Intl.DateTimeFormat("es-CL", { dateStyle: "full", timeStyle: "short" }).format(d);
}

/** Columna Excel 1-based (1 = A). */
function excelColumnLetter(col: number): string {
  let s = "";
  let c = col;
  while (c > 0) {
    const m = (c - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    c = Math.floor((c - 1) / 26);
  }
  return s;
}

function códigoProducto(row: Pick<ProductExportSource, "sku" | "barcode">): string {
  const sku = typeof row.sku === "string" ? row.sku.trim() : "";
  if (sku) return sku;
  const bc = typeof row.barcode === "string" ? row.barcode.trim() : "";
  if (bc) return bc;
  return "—";
}

function unidadCorta(unitType: string): string {
  const u = unitType.trim();
  if (!u) return "—";
  if (u.length <= 4) return u.charAt(0).toUpperCase() + u.slice(1).toLowerCase();
  return u.toUpperCase();
}

function agregarPortada(wb: ExcelJS.Workbook, ctx: MultistockExportWorkbookContext, logoImgId?: number) {
  const ws = wb.addWorksheet("Portada", {
    properties: { tabColor: { argb: "FF203864" } },
  });
  ws.columns = [{ width: 3 }, { width: 26 }, { width: 62 }];

  if (logoImgId != null) {
    ws.getRow(1).height = 58;
    ws.addImage(logoImgId, { tl: { col: 0, row: 0 }, ext: { width: 170, height: 96 } });
    ws.mergeCells("B1:H3");
    const t = ws.getCell("B1");
    t.value = "MultiStock";
    t.font = { bold: true, size: 22 };
    t.alignment = { horizontal: "center", vertical: "middle" };
    t.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE7EEF7" } };
    ws.mergeCells("B4:H4");
    const sub = ws.getCell("B4");
    sub.value = "Informe estándar (misma estructura para cualquier negocio)";
    sub.font = { italic: true, size: 12, color: { argb: "FF595959" } };
    sub.alignment = { horizontal: "center", vertical: "middle" };
  } else {
    ws.mergeCells("A1:H3");
    const t = ws.getCell("A1");
    t.value = "MultiStock";
    t.font = { bold: true, size: 22 };
    t.alignment = { horizontal: "center", vertical: "middle" };
    t.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE7EEF7" } };
    ws.mergeCells("A4:H4");
    const sub = ws.getCell("A4");
    sub.value = "Informe estándar (misma estructura para cualquier negocio)";
    sub.font = { italic: true, size: 12 };
    sub.alignment = { horizontal: "center", vertical: "middle" };
  }

  const textoUnificado =
    "Esta plantilla unifica hojas y columnas entre verdulerías, almacenes y ferreterías; solo cambian los datos según el negocio seleccionado al exportar.";

  const filaTxt = 6;
  ws.mergeCells(`A${filaTxt}:H${filaTxt + 2}`);
  const u = ws.getCell(`A${filaTxt}`);
  u.value = textoUnificado;
  u.font = { size: 11 };
  u.alignment = { vertical: "top", horizontal: "left", wrapText: true };
  ws.getRow(filaTxt).height = 54;

  let r = filaTxt + 4;
  const filasDatos: [string, string][] = [
    ["Negocio", ctx.businessName],
    ["ID del negocio", ctx.businessId],
    ["Rubro", ctx.businessTypeLabel],
    ["Fecha de exportación", formatoFechaHumanaLocal(ctx.exportedAt)],
    ["Generado por", ctx.exporterEmail?.trim() || "—"],
  ];

  ws.getCell(`A${r}`).value = "Detalle";
  ws.getCell(`A${r}`).font = { bold: true, size: 13 };

  r += 1;
  for (const [clave, valor] of filasDatos) {
    ws.getCell(r, 1).value = clave;
    ws.getCell(r, 1).font = { bold: true };
    ws.mergeCells(r, 2, r, 8);
    const v = ws.getCell(r, 2);
    v.value = valor;
    v.alignment = { wrapText: true, vertical: "top" };
    r += 1;
  }

  r += 1;
  ws.mergeCells(r, 1, r + 1, 8);
  ws.getCell(r, 1).value =
    "Nota: en la hoja Inventario, ALMACÉN muestra el nombre del negocio (un punto de despacho por negocio en MultiStock).";
  ws.getCell(r, 1).font = { italic: true, size: 10, color: { argb: "FF595959" } };
  ws.getCell(r, 1).alignment = { wrapText: true };
}

function aplicarEncabezadoHoja(
  ws: ExcelJS.Worksheet,
  lastCol: number,
  subtítuloSinNegocio: string,
  etiquetaLista: string,
  businessName: string,
  logoImgId?: number
) {
  const L = excelColumnLetter(lastCol);
  const linea2 = `${subtítuloSinNegocio} · ${businessName}`;

  if (logoImgId != null) {
    ws.getRow(1).height = 48;
    ws.getRow(2).height = 22;
    ws.addImage(logoImgId, { tl: { col: 0, row: 0 }, ext: { width: 112, height: 64 } });
    ws.mergeCells(`C1:${L}1`);
    const h1 = ws.getCell("C1");
    h1.value = "MultiStock";
    h1.font = { bold: true, size: 18 };
    h1.alignment = { horizontal: "center", vertical: "middle" };
    h1.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE7EEF7" } };
    ws.mergeCells(`C2:${L}2`);
    const h2 = ws.getCell("C2");
    h2.value = linea2;
    h2.font = { italic: true, size: 12, color: { argb: "FF595959" } };
    h2.alignment = { horizontal: "center", vertical: "middle" };
  } else {
    ws.getRow(1).height = 30;
    ws.mergeCells(`A1:${L}1`);
    ws.getCell(1, 1).value = "MultiStock";
    ws.getCell(1, 1).font = { bold: true, size: 18 };
    ws.getCell(1, 1).alignment = { horizontal: "center", vertical: "middle" };
    ws.getCell(1, 1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE7EEF7" } };
    ws.getRow(2).height = 22;
    ws.mergeCells(`A2:${L}2`);
    ws.getCell(2, 1).value = linea2;
    ws.getCell(2, 1).font = { italic: true, size: 12, color: { argb: "FF595959" } };
    ws.getCell(2, 1).alignment = { horizontal: "center", vertical: "middle" };
  }

  ws.getRow(3).height = 8;
  ws.getCell(4, 1).value = etiquetaLista;
  ws.getCell(4, 1).font = { bold: true, size: 14 };
  ws.getCell(4, 1).alignment = { horizontal: "left", vertical: "middle" };
  ws.getRow(5).height = 6;
}

function estiloCabeceraTabla(ws: ExcelJS.Worksheet, fila: number, etiquetas: string[], columnaSolicitarÚltima?: boolean) {
  const row = ws.getRow(fila);
  etiquetas.forEach((texto, idx) => {
    const cell = row.getCell(idx + 1);
    cell.value = texto;
    const esSolicitar = Boolean(columnaSolicitarÚltima && idx === etiquetas.length - 1);
    cell.font = { bold: true, color: { argb: esSolicitar ? "FF000000" : WHITE } };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    cell.fill = esSolicitar
      ? { type: "pattern", pattern: "solid", fgColor: { argb: HEADER_GRAY } }
      : { type: "pattern", pattern: "solid", fgColor: { argb: HEADER_BLUE } };
    cell.border = {
      top: { style: "thin", color: { argb: "FF1F497D" } },
      left: { style: "thin", color: { argb: "FF1F497D" } },
      bottom: { style: "thin", color: { argb: "FF1F497D" } },
      right: { style: "thin", color: { argb: "FF1F497D" } },
    };
  });
  row.height = 22;
}

function pintarFilasAlternadas(ws: ExcelJS.Worksheet, primera: number, última: number) {
  if (última < primera) return;
  for (let r = primera; r <= última; r++) {
    if ((r - primera) % 2 === 1) {
      ws.getRow(r).eachCell((cell) => {
        const f = cell.fill;
        const hasSolid = f && f.type === "pattern" && "fgColor" in f && Boolean(f.fgColor?.argb);
        if (!hasSolid) {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: STRIPE_GRAY } };
        }
      });
    }
  }
}

function formatoSemaforoEstado(ws: ExcelJS.Worksheet, colEstadoIdx0: number, filaIni: number, filaFin: number) {
  if (filaFin < filaIni) return;
  for (let r = filaIni; r <= filaFin; r++) {
    const cell = ws.getRow(r).getCell(colEstadoIdx0 + 1);
    const val = String(cell.value ?? "");
    let fillArgb: string | undefined;
    if (val.includes("Crítico")) fillArgb = "FFFFC7CE";
    else if (val.includes("bajo")) fillArgb = "FFFFF2CC";
    else if (val === "OK") fillArgb = "FFC6EFCE";
    else if (val.includes("mínimo")) fillArgb = "FFE7E6E6";
    if (fillArgb) {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: fillArgb } };
    }
  }
}

function formatoSolicitar(ws: ExcelJS.Worksheet, colIdx0: number, filaIni: number, filaFin: number) {
  if (filaFin < filaIni) return;
  for (let r = filaIni; r <= filaFin; r++) {
    const cell = ws.getRow(r).getCell(colIdx0 + 1);
    const val = String(cell.value ?? "");
    let fillArgb: string;
    if (val.includes("Hay suficiente")) fillArgb = "FFC6EFCE";
    else if (val.includes("Solicitar material")) fillArgb = "FFFFF2CC";
    else fillArgb = "FFE7E6E6";
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: fillArgb } };
    cell.border = {
      left: { style: "thin", color: { argb: "FFAAAAAA" } },
      right: { style: "thin", color: { argb: "FFAAAAAA" } },
    };
  }
}

export async function buildMultistockExcelBuffer(opts: {
  context: MultistockExportWorkbookContext;
  source: ExportSourceSubset;
}): Promise<Buffer> {
  const { context, source } = opts;
  const { businessName, exportedAt } = context;

  const wb = new ExcelJS.Workbook();
  wb.creator = "MultiStock";
  wb.created = exportedAt;
  wb.modified = exportedAt;

  const logoAsset = loadExcelBrandLogo();
  const logoImageId = logoAsset
    ? wb.addImage({
        // Tipos de exceljs vs Buffer de Node (22+)
        buffer: logoAsset.buffer as never,
        extension: logoAsset.extension,
      })
    : undefined;

  agregarPortada(wb, context, logoImageId);

  const hProductos = ["CÓDIGO", "DESCRIPCIÓN", "UdM", "CATEGORÍA", "PRECIO", "ESTADO"];
  const wsP = wb.addWorksheet("Productos", {
    views: [{ state: "frozen", ySplit: 6 }],
    properties: { tabColor: { argb: "FF548235" } },
  });

  aplicarEncabezadoHoja(wsP, hProductos.length, "Productos · catálogo", "Lista · Productos", businessName, logoImageId);
  estiloCabeceraTabla(wsP, 6, hProductos);
  const pDataStart = 7;
  source.products.forEach((p, idx) => {
    const row = wsP.getRow(pDataStart + idx);
    const precio = num(p.sale_price);
    row.getCell(1).value = códigoProducto(p);
    row.getCell(2).value = p.name;
    row.getCell(3).value = unidadCorta(p.unit_type);
    row.getCell(4).value = categoryLabel(p);
    const cPrecio = row.getCell(5);
    if (Number.isFinite(precio)) {
      cPrecio.value = precio;
      cPrecio.numFmt = '"$"#,##0';
    } else {
      cPrecio.value = "—";
    }
    row.getCell(6).value = p.active ? "Activo" : "Inactivo";
    row.getCell(1).alignment = { horizontal: "center", vertical: "middle" };
    row.getCell(2).alignment = { horizontal: "left", vertical: "middle" };
    row.getCell(3).alignment = { horizontal: "center", vertical: "middle" };
    row.getCell(4).alignment = { horizontal: "center", vertical: "middle" };
    row.getCell(5).alignment = { horizontal: "right", vertical: "middle" };
    row.getCell(6).alignment = { horizontal: "center", vertical: "middle" };
    row.border = {
      top: { style: "thin", color: { argb: "FFCCCCCC" } },
      bottom: { style: "thin", color: { argb: "FFCCCCCC" } },
    };
  });

  const pLast = source.products.length ? pDataStart + source.products.length - 1 : pDataStart - 1;
  if (source.products.length) pintarFilasAlternadas(wsP, pDataStart, pLast);
  wsP.getRow(pDataStart + source.products.length + 1)
    .getCell(1)
    .value = `TOTAL REGISTROS: ${source.products.length}`;
  wsP.getRow(pDataStart + source.products.length + 1).font = { bold: true };

  wsP.columns = [{ width: 14 }, { width: 42 }, { width: 8 }, { width: 18 }, { width: 14 }, { width: 12 }];

  const hInv = [
    "CÓDIGO",
    "DESCRIPCIÓN",
    "UdM",
    "CATEGORÍA",
    "ALMACÉN",
    "STOCK MÍNIMO",
    "INVENTARIO",
    "ESTADO",
    "SOLICITAR",
  ];
  const wsI = wb.addWorksheet("Inventario", {
    views: [{ state: "frozen", ySplit: 6 }],
    properties: { tabColor: { argb: HEADER_BLUE } },
  });

  aplicarEncabezadoHoja(
    wsI,
    hInv.length,
    "Inventario · control de materiales",
    "Lista · Inventario",
    businessName,
    logoImageId
  );
  estiloCabeceraTabla(wsI, 6, hInv, true);
  const iDataStart = 7;

  source.inventoryProducts.forEach((p, idx) => {
    const row = wsI.getRow(iDataStart + idx);
    const stk = num(p.current_stock);
    const mín = num(p.min_stock);
    const estado = inventarioEstadoCalculado(stk, mín);
    const solicitar = inventarioSolicitarEtiqueta(stk, mín);
    row.getCell(1).value = códigoProducto(p);
    row.getCell(2).value = p.name;
    row.getCell(3).value = unidadCorta(p.unit_type);
    row.getCell(4).value = categoryLabel(p);
    row.getCell(5).value = businessName;
    row.getCell(6).value = Number.isFinite(mín) ? mín : "—";
    row.getCell(7).value = Number.isFinite(stk) ? stk : "—";
    row.getCell(8).value = estado;
    row.getCell(9).value = solicitar;

    row.getCell(1).alignment = { horizontal: "center", vertical: "middle" };
    row.getCell(2).alignment = { horizontal: "left", vertical: "middle" };
    row.getCell(3).alignment = { horizontal: "center", vertical: "middle" };
    row.getCell(4).alignment = { horizontal: "center", vertical: "middle" };
    row.getCell(5).alignment = { horizontal: "center", vertical: "middle" };
    row.getCell(6).alignment = { horizontal: "right", vertical: "middle" };
    row.getCell(7).alignment = { horizontal: "right", vertical: "middle" };
    row.getCell(8).alignment = { horizontal: "center", vertical: "middle" };
    row.getCell(9).alignment = { horizontal: "center", vertical: "middle" };
    row.border = {
      top: { style: "thin", color: { argb: "FFCCCCCC" } },
      bottom: { style: "thin", color: { argb: "FFCCCCCC" } },
    };
  });

  const iLast = source.inventoryProducts.length ? iDataStart + source.inventoryProducts.length - 1 : iDataStart - 1;
  if (source.inventoryProducts.length) {
    pintarFilasAlternadas(wsI, iDataStart, iLast);
    formatoSemaforoEstado(wsI, 7, iDataStart, iLast);
    formatoSolicitar(wsI, 8, iDataStart, iLast);
  }

  wsI.getRow(iLast + 2)
    .getCell(1)
    .value = `TOTAL REGISTROS: ${source.inventoryProducts.length}`;
  wsI.getRow(iLast + 2).font = { bold: true };

  wsI.columns = [
    { width: 14 },
    { width: 36 },
    { width: 8 },
    { width: 18 },
    { width: 22 },
    { width: 14 },
    { width: 12 },
    { width: 16 },
    { width: 22 },
  ];

  const hM = ["FECHA", "TIPO", "CANTIDAD", "MOTIVO"];
  const wsM = wb.addWorksheet("Movimientos", {
    views: [{ state: "frozen", ySplit: 6 }],
    properties: { tabColor: { argb: "FFFFC000" } },
  });
  aplicarEncabezadoHoja(wsM, hM.length, "Movimientos de stock", "Lista · Movimientos", businessName, logoImageId);
  estiloCabeceraTabla(wsM, 6, hM);
  const mStart = 7;
  source.movements.forEach((m, idx) => {
    const row = wsM.getRow(mStart + idx);
    const q = num(m.quantity);
    row.getCell(1).value = parseExcelDate(m.created_at);
    row.getCell(1).numFmt = "dd/mm/yyyy hh:mm";
    row.getCell(2).value = movementTypeLabel(m.type);
    const cq = row.getCell(3);
    if (Number.isFinite(q)) {
      cq.value = q;
      cq.numFmt = "#,##0.####";
    } else cq.value = m.quantity ?? "—";
    row.getCell(4).value = m.reason ?? "—";
    row.getCell(1).alignment = { horizontal: "left", vertical: "middle" };
    row.getCell(2).alignment = { horizontal: "left", vertical: "middle" };
    row.getCell(3).alignment = { horizontal: "right", vertical: "middle" };
    row.getCell(4).alignment = { horizontal: "left", vertical: "middle" };
    row.border = {
      top: { style: "thin", color: { argb: "FFCCCCCC" } },
      bottom: { style: "thin", color: { argb: "FFCCCCCC" } },
    };
  });
  const mLast = source.movements.length ? mStart + source.movements.length - 1 : mStart - 1;
  if (source.movements.length) pintarFilasAlternadas(wsM, mStart, mLast);
  wsM.getRow(mLast + 2).getCell(1).value = `TOTAL REGISTROS: ${source.movements.length}`;
  wsM.getRow(mLast + 2).font = { bold: true };

  wsM.columns = [{ width: 22 }, { width: 18 }, { width: 14 }, { width: 48 }];

  const hV = ["FECHA", "TOTAL", "MÉTODO DE PAGO"];
  const wsV = wb.addWorksheet("Ventas", {
    views: [{ state: "frozen", ySplit: 6 }],
    properties: { tabColor: { argb: "FF9DC3E6" } },
  });
  aplicarEncabezadoHoja(wsV, hV.length, "Ventas registradas", "Lista · Ventas", businessName, logoImageId);
  estiloCabeceraTabla(wsV, 6, hV);
  const vStart = 7;
  let sumaVentas = 0;
  source.sales.forEach((s, idx) => {
    const row = wsV.getRow(vStart + idx);
    row.getCell(1).value = parseExcelDate(s.created_at);
    row.getCell(1).numFmt = "dd/mm/yyyy hh:mm";
    const t = num(s.total);
    const cTot = row.getCell(2);
    if (Number.isFinite(t)) {
      sumaVentas += t;
      cTot.value = t;
      cTot.numFmt = '"$"#,##0';
    }
    row.getCell(3).value =
      s.payment_method && s.payment_method in paymentMethodLabels
        ? paymentMethodLabels[s.payment_method as keyof typeof paymentMethodLabels]
        : String(s.payment_method ?? "—");

    row.getCell(1).alignment = { horizontal: "left", vertical: "middle" };
    row.getCell(2).alignment = { horizontal: "right", vertical: "middle" };
    row.getCell(3).alignment = { horizontal: "left", vertical: "middle" };
    row.border = {
      top: { style: "thin", color: { argb: "FFCCCCCC" } },
      bottom: { style: "thin", color: { argb: "FFCCCCCC" } },
    };
  });

  const vLast = source.sales.length ? vStart + source.sales.length - 1 : vStart - 1;
  if (source.sales.length) pintarFilasAlternadas(wsV, vStart, vLast);

  const vFoot = vLast + 2;
  wsV.getRow(vFoot).getCell(1).value = `TOTAL REGISTROS: ${source.sales.length}`;
  wsV.getRow(vFoot).font = { bold: true };

  wsV.getRow(vFoot + 1).getCell(1).value = "TOTAL $ (suma período exportado):";
  const sumCell = wsV.getRow(vFoot + 1).getCell(2);
  sumCell.value = sumaVentas;
  sumCell.numFmt = '"$"#,##0';
  sumCell.font = { bold: true };
  wsV.getRow(vFoot + 1).font = { bold: true };

  wsV.columns = [{ width: 22 }, { width: 16 }, { width: 20 }];

  const hA = ["FECHA", "TIPO", "MENSAJE", "ESTADO"];
  const wsA = wb.addWorksheet("Alertas", {
    views: [{ state: "frozen", ySplit: 6 }],
    properties: { tabColor: { argb: "FFC65911" } },
  });
  aplicarEncabezadoHoja(wsA, hA.length, "Alertas de stock", "Lista · Alertas", businessName, logoImageId);
  estiloCabeceraTabla(wsA, 6, hA);
  const aStart = 7;
  source.alerts.forEach((a, idx) => {
    const row = wsA.getRow(aStart + idx);
    row.getCell(1).value = parseExcelDate(a.created_at);
    row.getCell(1).numFmt = "dd/mm/yyyy hh:mm";
    row.getCell(2).value = a.type;
    row.getCell(3).value = a.message ?? "—";
    row.getCell(4).value = a.resolved ? "Resuelta" : "Pendiente";
    row.getCell(1).alignment = { horizontal: "left", vertical: "middle" };
    row.getCell(2).alignment = { horizontal: "left", vertical: "middle" };
    row.getCell(3).alignment = { horizontal: "left", vertical: "middle" };
    row.getCell(4).alignment = { horizontal: "center", vertical: "middle" };
    row.border = {
      top: { style: "thin", color: { argb: "FFCCCCCC" } },
      bottom: { style: "thin", color: { argb: "FFCCCCCC" } },
    };
  });

  const aLast = source.alerts.length ? aStart + source.alerts.length - 1 : aStart - 1;
  if (source.alerts.length) pintarFilasAlternadas(wsA, aStart, aLast);

  wsA.getRow(aLast + 2).getCell(1).value = `TOTAL REGISTROS: ${source.alerts.length}`;
  wsA.getRow(aLast + 2).font = { bold: true };

  wsA.columns = [{ width: 22 }, { width: 18 }, { width: 48 }, { width: 12 }];

  const raw = await wb.xlsx.writeBuffer();
  return Buffer.from(raw);
}
