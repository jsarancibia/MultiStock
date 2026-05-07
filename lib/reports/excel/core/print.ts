/**
 * Configuración de impresión para hojas Excel.
 *
 * Centraliza todas las opciones de pageSetup, márgenes, orientación,
 * repetición de encabezados y header/footer de impresión.
 *
 * Todos los reportes deben llamar configurePrint() al final de la generación,
 * antes de serializar el workbook.
 */
import type ExcelJS from "exceljs";

// ── Tipos ──────────────────────────────────────────────────────────────────

export type PaperSize =
  | "A4"       // 9
  | "A3"       // 8
  | "Letter"   // 1
  | "Legal";   // 5

const PAPER_CODES: Record<PaperSize, number> = {
  A4: 9,
  A3: 8,
  Letter: 1,
  Legal: 5,
};

export type PrintOptions = {
  /** Orientación de impresión. Default: "landscape" */
  orientation?: "portrait" | "landscape";
  /** Tamaño de papel. Default: "A4" */
  paper?: PaperSize;
  /** Ajustar todo a 1 página de ancho. Default: true */
  fitToPage?: boolean;
  /** Número de página de ancho al imprimir (0 = automático). Default: 1 */
  fitToWidth?: number;
  /** Número de filas de encabezado de tabla a repetir en cada página impresa */
  repeatHeaderRow?: number;
  /** Mostrar cuadrícula en impresión. Default: false */
  showGridLines?: boolean;
};

export type PrintContext = {
  reportTitle?: string;
  businessName?: string;
};

// ── Función principal ──────────────────────────────────────────────────────

/**
 * Configura las opciones de impresión de una hoja de cálculo.
 *
 * - Orientación landscape por defecto (recomendado para tablas anchas)
 * - Márgenes estándar para impresión corporativa
 * - Repetición automática del encabezado de tabla en cada página
 * - Header/footer de impresión con nombre del reporte y numeración de páginas
 */
export function configurePrint(
  ws: ExcelJS.Worksheet,
  opts: PrintOptions = {},
  ctx: PrintContext = {}
): void {
  const {
    orientation = "landscape",
    paper = "A4",
    fitToPage = true,
    fitToWidth = 1,
    repeatHeaderRow,
    showGridLines = false,
  } = opts;

  ws.pageSetup = {
    paperSize: PAPER_CODES[paper],
    orientation,
    fitToPage,
    fitToWidth,
    fitToHeight: 0,
    horizontalCentered: true,
    margins: {
      left: 0.5,
      right: 0.5,
      top: 0.75,
      bottom: 0.75,
      header: 0.3,
      footer: 0.3,
    },
    showGridLines,
    ...(repeatHeaderRow != null && {
      printTitlesRow: `$${repeatHeaderRow}:$${repeatHeaderRow}`,
    }),
  };

  // Header/footer de impresión (visible solo al imprimir o en Vista de diseño de página)
  const title = ctx.reportTitle ?? "Reporte";
  const biz = ctx.businessName ?? "MultiStock";

  ws.headerFooter = {
    oddHeader: `&L&B ${biz}&C&B&14 ${title}&R&D &T`,
    oddFooter: `&L${title}&C Página &P de &N &R${biz}`,
    evenHeader: `&L&B ${biz}&C&B&14 ${title}&R&D &T`,
    evenFooter: `&L${title}&C Página &P de &N &R${biz}`,
  };
}
