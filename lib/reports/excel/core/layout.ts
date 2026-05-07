/**
 * Header corporativo para reportes Excel.
 *
 * Estructura visual:
 * ┌──────────────────────────────────────────────────────────┐
 * │ [Logo]  MultiStock                          [Negocio]    │ ← Row 1 (brandBar, h=24)
 * │         Título del Reporte          [Fecha exportación]  │ ← Row 2 (título + meta, h=30)
 * │         Descripción opcional                             │ ← Row 3 (subtítulo, h=18) opcional
 * │ ─────────────────────── separador ───────────────────── │ ← Row N (h=6)
 * │  Col1   │  Col2  │  Col3  │ ...                         │ ← Row N+1 (headerStyle)
 * └──────────────────────────────────────────────────────────┘
 *
 * Panel congelado: siempre en la fila del header de tabla.
 */
import type ExcelJS from "exceljs";
import { Brand } from "./colors";
import {
  applyStyle,
  brandBarStyle,
  titleStyle,
  subtitleStyle,
  metaStyle,
  bizNameStyle,
} from "./styles";
import { placeLogoInSheet, type LogoPlacementOptions } from "./images";
import { formatExportDate } from "../utils/currency";

export type LayoutContext = {
  reportTitle: string;
  reportDescription?: string;
  businessName: string;
  businessTypeLabel: string;
  exportedAt: Date;
};

/**
 * Número de filas que ocupa el header corporativo.
 * Con descripción: 4 filas (brandBar + titulo + descripcion + separador)
 * Sin descripción: 3 filas (brandBar + titulo/meta + separador)
 */
export function headerRowCount(hasDescription: boolean): number {
  return hasDescription ? 4 : 3;
}

/**
 * Aplica el header corporativo a una hoja de cálculo.
 *
 * @param ws        - Worksheet de ExcelJS
 * @param ctx       - Contexto del reporte (título, negocio, fecha)
 * @param colCount  - Número total de columnas del reporte
 * @param logoId    - ID del logo registrado (opcional)
 * @returns         - Número de fila donde debe comenzar el header de tabla
 */
export function applyBrandHeader(
  ws: ExcelJS.Worksheet,
  ctx: LayoutContext,
  colCount: number,
  logoId?: number
): number {
  const hasDesc = Boolean(ctx.reportDescription);

  // ── Row 1: Barra de marca ──────────────────────────────────────────────
  ws.mergeCells(1, 1, 1, colCount);
  const brandCell = ws.getCell(1, 1);
  applyStyle(brandCell, brandBarStyle);
  brandCell.value = "MultiStock";
  ws.getRow(1).height = 24;

  // ── Row 2: Título + Nombre de negocio ─────────────────────────────────
  // Dividimos en 60% título / 40% negocio para dar espacio visual
  const splitCol = Math.max(2, Math.floor(colCount * 0.6));

  ws.mergeCells(2, 1, 2, splitCol);
  const titleCell = ws.getCell(2, 1);
  applyStyle(titleCell, titleStyle);
  titleCell.value = ctx.reportTitle;
  ws.getRow(2).height = 30;

  if (splitCol < colCount) {
    ws.mergeCells(2, splitCol + 1, 2, colCount);
    const bizCell = ws.getCell(2, splitCol + 1);
    applyStyle(bizCell, bizNameStyle);
    bizCell.value = `${ctx.businessName} · ${ctx.businessTypeLabel}`;
  }

  let currentRow = 3;

  // ── Row 3 (opcional): Descripción + Fecha de exportación ──────────────
  if (hasDesc) {
    const descSplit = Math.max(2, Math.floor(colCount * 0.55));

    ws.mergeCells(3, 1, 3, descSplit);
    const descCell = ws.getCell(3, 1);
    applyStyle(descCell, subtitleStyle);
    descCell.value = ctx.reportDescription!;
    ws.getRow(3).height = 18;

    if (descSplit < colCount) {
      ws.mergeCells(3, descSplit + 1, 3, colCount);
      const dateCell = ws.getCell(3, descSplit + 1);
      applyStyle(dateCell, metaStyle);
      dateCell.value = `Exportado: ${formatExportDate(ctx.exportedAt)}`;
    }

    currentRow = 4;
  } else {
    // Sin descripción: fecha en row 2 ya cubierta, solo añadimos meta en row 3
    ws.mergeCells(3, 1, 3, colCount);
    const metaCell = ws.getCell(3, 1);
    applyStyle(metaCell, metaStyle);
    metaCell.value = `Exportado: ${formatExportDate(ctx.exportedAt)}`;
    ws.getRow(3).height = 16;

    currentRow = 4;
  }

  // ── Fila separadora (verde, altura mínima) ────────────────────────────
  const sepRow = currentRow;
  ws.getRow(sepRow).height = 6;
  for (let c = 1; c <= colCount; c++) {
    ws.getCell(sepRow, c).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: Brand.primary },
    };
  }

  // ── Logo (opcional) ───────────────────────────────────────────────────
  if (logoId != null) {
    const placement: LogoPlacementOptions = {
      logoId,
      colOffset: 0.12,
      rowOffset: 0.12,
      widthPx: 60,
      heightPx: 36,
    };
    placeLogoInSheet(ws, placement);
  }

  // La fila del header de tabla es la siguiente al separador
  return sepRow + 1;
}

/**
 * Configura el panel congelado de la hoja para que el header de tabla
 * permanezca visible al hacer scroll.
 *
 * @param ws            - Worksheet
 * @param tableHeaderRow - Número de fila del header de tabla (retornado por applyBrandHeader)
 */
export function applyFreezePane(ws: ExcelJS.Worksheet, tableHeaderRow: number): void {
  ws.views = [
    {
      state: "frozen",
      ySplit: tableHeaderRow,
      topLeftCell: `A${tableHeaderRow + 1}`,
    },
  ];
}
