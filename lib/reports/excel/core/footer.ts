/**
 * Footer corporativo para hojas de datos Excel.
 *
 * Agrega una fila de pie de página visible al final de los datos del reporte.
 * No reemplaza el ws.headerFooter de impresión (eso lo hace print.ts).
 * Este footer es visible en la hoja normal y sirve como cierre visual.
 *
 * Estructura visual:
 * ───────────────────────────────────────────────────────────────
 * │ MultiStock · Sistema de Gestión   Generado: 06/05/2026 14:30 │
 * │ Negocio: Almacén Central          Este reporte es confidencial│
 * ───────────────────────────────────────────────────────────────
 */
import type ExcelJS from "exceljs";
import { applyStyle, type StyleSet, DEFAULT_STYLE_SET } from "./styles";
import { formatExportDate } from "../utils/currency";
import type { ExcelReportContext } from "./workbook";

// ── Constantes ─────────────────────────────────────────────────────────────

const SEPARATOR_HEIGHT = 4;
const FOOTER_HEIGHT = 14;

// ── Función principal ──────────────────────────────────────────────────────

/**
 * Renderiza el footer corporativo al final de los datos.
 *
 * @param ws          - Worksheet de destino
 * @param ctx         - Contexto del reporte (negocio, fecha, exportador)
 * @param startRow    - Primera fila libre después de los datos
 * @param colCount    - Número total de columnas
 * @param reportTitle - Título del reporte
 * @param styles      - StyleSet del tema activo
 * @returns           - Número de la última fila del footer
 */
export function renderCorporateFooter(
  ws: ExcelJS.Worksheet,
  ctx: ExcelReportContext,
  startRow: number,
  colCount: number,
  reportTitle: string,
  styles: StyleSet = DEFAULT_STYLE_SET
): number {
  // Fila separadora antes del footer
  const sepRow = startRow;
  ws.getRow(sepRow).height = SEPARATOR_HEIGHT;
  for (let c = 1; c <= colCount; c++) {
    if (styles.footer.fill) {
      ws.getCell(sepRow, c).fill = styles.footer.fill;
    }
  }

  // Fila footer: 2 secciones (izquierda y derecha)
  const footerRow = sepRow + 1;
  ws.getRow(footerRow).height = FOOTER_HEIGHT;

  const mid = Math.ceil(colCount / 2);

  // Sección izquierda: branding + negocio
  ws.mergeCells(footerRow, 1, footerRow, mid);
  const leftCell = ws.getCell(footerRow, 1);
  applyStyle(leftCell, styles.footerMeta);
  leftCell.value = `MultiStock · ${reportTitle}  ·  ${ctx.businessName}`;
  leftCell.alignment = { horizontal: "left", vertical: "middle" };

  // Sección derecha: fecha + exportador
  if (mid < colCount) {
    ws.mergeCells(footerRow, mid + 1, footerRow, colCount);
    const rightCell = ws.getCell(footerRow, mid + 1);
    applyStyle(rightCell, styles.footer);
    const exporterInfo = ctx.exporterEmail ? `  ·  ${ctx.exporterEmail}` : "";
    rightCell.value = `Generado: ${formatExportDate(ctx.exportedAt)}${exporterInfo}`;
    rightCell.alignment = { horizontal: "right", vertical: "middle" };
  }

  return footerRow;
}
