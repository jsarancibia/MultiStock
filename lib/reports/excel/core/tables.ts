/**
 * Helpers para construir tablas de datos en hojas Excel.
 *
 * Responsabilidades:
 * - Renderizar fila de encabezado de tabla (headerStyle)
 * - Renderizar filas de datos con alternancia de color
 * - Aplicar autofilter al rango de datos
 * - Respetar el tipo semántico de cada columna (moneda, número, fecha, etc.)
 *
 * NUNCA incluye lógica de header corporativo (eso es layout.ts).
 */
import type ExcelJS from "exceljs";
import {
  applyStyle,
  headerStyle,
  stripeOverlay,
  styleForColumnType,
  stockAlertStyle,
  stockOkStyle,
  stockWarnStyle,
} from "./styles";

// ── Tipos públicos ─────────────────────────────────────────────────────────

export type ColumnAlign = "left" | "center" | "right";

export type ColumnType =
  | "text"
  | "number"
  | "currency"
  | "date"
  | "datetime"
  | "status"
  | "stock";

export type ReportColumn = {
  /** Texto del encabezado */
  header: string;
  /** Key correspondiente en ReportRow */
  key: string;
  /** Ancho manual en unidades de ExcelJS (caracteres aproximados) */
  width: number;
  /** Alineación horizontal del contenido */
  align?: ColumnAlign;
  /** Tipo semántico: define formato numérico y estilo automático */
  type?: ColumnType;
  /** Formato numFmt personalizado (tiene precedencia sobre type) */
  numFmt?: string;
};

export type ReportRow = Record<string, string | number | Date | null | undefined>;

// ── Fila de encabezado ─────────────────────────────────────────────────────

/**
 * Escribe la fila de encabezado de tabla con headerStyle.
 * Aplica los anchos de columna definidos.
 *
 * @returns Número de fila del encabezado (para referencia posterior)
 */
export function applyTableHeader(
  ws: ExcelJS.Worksheet,
  columns: ReportColumn[],
  rowNumber: number
): number {
  // Anchos de columna
  columns.forEach((col, idx) => {
    ws.getColumn(idx + 1).width = col.width;
  });

  // Fila de header
  const headerRow = ws.getRow(rowNumber);
  headerRow.height = 24;

  columns.forEach((col, idx) => {
    const cell = headerRow.getCell(idx + 1);
    applyStyle(cell, headerStyle);
    cell.value = col.header;
  });

  headerRow.commit();
  return rowNumber;
}

// ── Filas de datos ─────────────────────────────────────────────────────────

/**
 * Escribe todas las filas de datos con alternancia de color y formatos correctos.
 *
 * @param ws         - Worksheet
 * @param columns    - Definición de columnas
 * @param rows       - Datos a renderizar
 * @param startRow   - Fila de inicio (justo después del header de tabla)
 * @returns          - Número de la última fila de datos escrita
 */
export function applyTableBody(
  ws: ExcelJS.Worksheet,
  columns: ReportColumn[],
  rows: ReportRow[],
  startRow: number
): number {
  rows.forEach((rowData, rowIdx) => {
    const rowNumber = startRow + rowIdx;
    const excelRow = ws.getRow(rowNumber);
    const isStripe = rowIdx % 2 === 1;
    excelRow.height = 18;

    columns.forEach((col, colIdx) => {
      const cell = excelRow.getCell(colIdx + 1);
      const value = rowData[col.key];

      // Estilo base según tipo de columna
      const baseStyle = styleForColumnType(col.type as Parameters<typeof styleForColumnType>[0], col.align);
      applyStyle(cell, baseStyle);

      // Alternancia de filas (stripe overlay)
      if (isStripe) {
        applyStyle(cell, stripeOverlay);
      }

      // Formato numérico personalizado (precedencia sobre tipo)
      if (col.numFmt) {
        cell.numFmt = col.numFmt;
      }

      // Asignar valor
      cell.value = value ?? null;

      // Estilo especial para columnas de stock/status
      if (col.type === "stock" && typeof value === "number") {
        applyCellStockStyle(cell, value);
      }
    });

    excelRow.commit();
  });

  return startRow + rows.length - 1;
}

// ── Autofilter ─────────────────────────────────────────────────────────────

/**
 * Aplica autofilter al rango de datos completo.
 * Permite filtrar y ordenar directamente en Excel.
 *
 * @param ws          - Worksheet
 * @param headerRow   - Número de fila del encabezado
 * @param lastDataRow - Número de la última fila de datos
 * @param colCount    - Número de columnas
 */
export function applyAutoFilter(
  ws: ExcelJS.Worksheet,
  headerRow: number,
  lastDataRow: number,
  colCount: number
): void {
  const endCol = columnLetter(colCount);
  ws.autoFilter = `A${headerRow}:${endCol}${lastDataRow}`;
}

// ── Helpers privados ───────────────────────────────────────────────────────

/**
 * Aplica estilo semántico de stock a una celda según el valor numérico.
 * Requiere configuración de umbral externa — aquí se usa un umbral genérico.
 * Para umbrales específicos, el generator debe llamar applyStyle directamente.
 */
function applyCellStockStyle(
  cell: ExcelJS.Cell,
  value: number
): void {
  if (value <= 0) {
    applyStyle(cell, stockAlertStyle);
  } else if (value <= 5) {
    applyStyle(cell, stockWarnStyle);
  } else {
    applyStyle(cell, stockOkStyle);
  }
}

/** Convierte un índice de columna (1-based) a letra de columna Excel (A, B, ..., Z, AA...) */
function columnLetter(colIndex: number): string {
  let result = "";
  let n = colIndex;
  while (n > 0) {
    const rem = (n - 1) % 26;
    result = String.fromCharCode(65 + rem) + result;
    n = Math.floor((n - 1) / 26);
  }
  return result;
}
