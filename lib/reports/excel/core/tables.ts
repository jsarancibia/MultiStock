/**
 * Helpers para construir tablas de datos en hojas Excel.
 *
 * Responsabilidades:
 * - Renderizar fila de encabezado de tabla (headerStyle)
 * - Renderizar filas de datos con alternancia de color
 * - Aplicar autofilter al rango de datos
 * - Respetar el tipo semántico de cada columna (moneda, número, fecha, etc.)
 * - Aplicar formato condicional programático si se proveen reglas
 *
 * Soporta StyleSet temático: si no se provee, usa los estilos estáticos por defecto.
 * NUNCA incluye lógica de header corporativo (eso es layout.ts).
 */
import type ExcelJS from "exceljs";
import {
  applyStyle,
  headerStyle,
  leftStyle,
  centeredStyle,
  rightStyle,
  currencyStyle,
  quantityStyle,
  dateStyle,
  datetimeStyle,
  stockAlertStyle,
  stockOkStyle,
  stockWarnStyle,
  stripeOverlay,
  type StyleSet,
} from "./styles";
import { applyConditionalToCell, type ConditionalRule } from "./conditional";

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
 * Escribe la fila de encabezado de tabla con headerStyle (o estilo temático).
 * Aplica los anchos de columna definidos.
 *
 * @param styles - StyleSet del tema activo (opcional)
 * @returns Número de fila del encabezado
 */
export function applyTableHeader(
  ws: ExcelJS.Worksheet,
  columns: ReportColumn[],
  rowNumber: number,
  styles?: StyleSet
): number {
  const sHeader = styles?.tableHeader ?? headerStyle;

  // Anchos de columna
  columns.forEach((col, idx) => {
    ws.getColumn(idx + 1).width = col.width;
  });

  const headerRow = ws.getRow(rowNumber);
  headerRow.height = 24;

  columns.forEach((col, idx) => {
    const cell = headerRow.getCell(idx + 1);
    applyStyle(cell, sHeader);
    cell.value = col.header;
  });

  headerRow.commit();
  return rowNumber;
}

// ── Filas de datos ─────────────────────────────────────────────────────────

/**
 * Escribe todas las filas de datos con alternancia de color y formatos correctos.
 * Aplica formato condicional si se proveen reglas.
 *
 * @param styles           - StyleSet del tema activo (opcional)
 * @param conditionalRules - Reglas de formato condicional (opcional)
 * @returns                - Número de la última fila de datos escrita
 */
export function applyTableBody(
  ws: ExcelJS.Worksheet,
  columns: ReportColumn[],
  rows: ReportRow[],
  startRow: number,
  styles?: StyleSet,
  conditionalRules?: ConditionalRule[]
): number {
  rows.forEach((rowData, rowIdx) => {
    const rowNumber = startRow + rowIdx;
    const excelRow = ws.getRow(rowNumber);
    const isStripe = rowIdx % 2 === 1;
    excelRow.height = 18;

    columns.forEach((col, colIdx) => {
      const cell = excelRow.getCell(colIdx + 1);
      const value = rowData[col.key];

      // Estilo base según tipo de columna (con soporte de StyleSet temático)
      const baseStyle = resolveColumnStyle(col.type, col.align, styles);
      applyStyle(cell, baseStyle);

      // Alternancia de filas (stripe overlay)
      if (isStripe) {
        const stripe = styles?.stripe ?? stripeOverlay;
        if (stripe.fill) cell.fill = stripe.fill;
      }

      // Formato numérico personalizado (precedencia sobre tipo)
      if (col.numFmt) {
        cell.numFmt = col.numFmt;
      }

      // Valor de la celda
      cell.value = value ?? null;

      // Estilo semántico de stock (si no hay regla condicional para esta columna)
      if (col.type === "stock" && typeof value === "number") {
        const hasConditionalForCol = conditionalRules?.some(
          (r) => (r.targetColumnKey ?? r.columnKey) === col.key
        );
        if (!hasConditionalForCol) {
          applyCellStockStyle(cell, value, styles);
        }
      }
    });

    // Formato condicional programático
    if (conditionalRules && conditionalRules.length > 0) {
      applyRowConditionals(excelRow, rowData, columns, conditionalRules, styles);
    }

    excelRow.commit();
  });

  return startRow + rows.length - 1;
}

// ── Autofilter ─────────────────────────────────────────────────────────────

/**
 * Aplica autofilter al rango de datos completo.
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
 * Resuelve el estilo base de una columna según su tipo y alineación.
 * Usa el StyleSet temático si está disponible, o los estilos estáticos.
 */
function resolveColumnStyle(
  type: ColumnType | undefined,
  align: ColumnAlign | undefined,
  styles?: StyleSet
) {
  if (type === "currency")  return styles?.dataCurrency  ?? currencyStyle;
  if (type === "number")    return styles?.dataQuantity  ?? quantityStyle;
  if (type === "date")      return styles?.dataDate      ?? dateStyle;
  if (type === "datetime")  return styles?.dataDatetime  ?? datetimeStyle;
  if (align === "center")   return styles?.dataCenter    ?? centeredStyle;
  if (align === "right")    return styles?.dataRight     ?? rightStyle;
  return styles?.dataLeft ?? leftStyle;
}

/**
 * Aplica estilo semántico de stock a una celda según el valor numérico.
 */
function applyCellStockStyle(
  cell: ExcelJS.Cell,
  value: number,
  styles?: StyleSet
): void {
  if (value <= 0) {
    applyStyle(cell, styles?.statusAlert ?? stockAlertStyle);
  } else if (value <= 5) {
    applyStyle(cell, styles?.statusWarn ?? stockWarnStyle);
  } else {
    applyStyle(cell, styles?.statusOk ?? stockOkStyle);
  }
}

/**
 * Aplica reglas de formato condicional a todas las columnas de una fila.
 */
function applyRowConditionals(
  excelRow: ExcelJS.Row,
  rowData: ReportRow,
  columns: ReportColumn[],
  rules: ConditionalRule[],
  styles?: StyleSet
): void {
  if (!styles) return;

  for (const rule of rules) {
    const evalValue = rowData[rule.columnKey];
    const targetKey = rule.targetColumnKey ?? rule.columnKey;
    const targetColIdx = columns.findIndex((c) => c.key === targetKey);
    if (targetColIdx === -1) continue;

    const cell = excelRow.getCell(targetColIdx + 1);
    applyConditionalToCell(cell, evalValue, rule, styles);
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
