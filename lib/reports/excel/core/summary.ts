/**
 * Summary Cards — bloques de métricas tipo dashboard.
 *
 * Genera una fila de cards horizontales con métricas clave del reporte,
 * situadas entre el header corporativo y el encabezado de tabla.
 *
 * Estructura visual (2 filas por grupo de cards):
 * ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐
 * │ Productos       │ │ Stock Bajo      │ │ Valor Inventario│ │ Activos         │
 * │ 1.240           │ │ 12              │ │ $1.450.000      │ │ 890             │
 * └────────────────┘ └────────────────┘ └────────────────┘ └────────────────┘
 *
 * API:
 *   summary: [
 *     { label: "Productos", value: 1240, type: "primary" },
 *     { label: "Stock Bajo", value: 12, type: "warning" },
 *   ]
 */
import type ExcelJS from "exceljs";
import { applyStyle, type StyleSet, DEFAULT_STYLE_SET } from "./styles";

// ── Tipos públicos ─────────────────────────────────────────────────────────

export type SummaryCardType =
  | "primary"   // Color principal del tema
  | "secondary" // Color neutro
  | "warning"   // Amarillo / advertencia
  | "danger"    // Rojo / crítico
  | "info";     // Azul / informativo

export type SummaryCard = {
  /** Etiqueta descriptiva del indicador */
  label: string;
  /** Valor numérico o texto del indicador */
  value: string | number;
  /** Unidad opcional (ej. "unidades", "$", "%") */
  unit?: string;
  /** Tipo semántico — define el color de acento */
  type?: SummaryCardType;
};

// ── Constantes internas ────────────────────────────────────────────────────

const LABEL_ROW_HEIGHT = 14;
const VALUE_ROW_HEIGHT = 24;
const PADDING_ROW_HEIGHT = 4;

// ── Función principal ──────────────────────────────────────────────────────

/**
 * Renderiza un grupo de summary cards en la hoja de cálculo.
 *
 * @param ws        - Worksheet de destino
 * @param cards     - Array de cards a renderizar
 * @param startRow  - Fila donde empezar (inmediatamente después del brand header)
 * @param colCount  - Número total de columnas del reporte
 * @param styles    - StyleSet del tema activo
 * @returns         - Número de la fila siguiente (la primera libre tras las cards)
 */
export function renderSummaryCards(
  ws: ExcelJS.Worksheet,
  cards: SummaryCard[],
  startRow: number,
  colCount: number,
  styles: StyleSet = DEFAULT_STYLE_SET
): number {
  if (cards.length === 0) return startRow;

  const cardCount = cards.length;
  // Ancho de cada card en columnas (distribuido uniformemente)
  const colsPerCard = Math.max(1, Math.floor(colCount / cardCount));

  // Fila de padding superior
  ws.getRow(startRow).height = PADDING_ROW_HEIGHT;
  fillPaddingRow(ws, startRow, colCount, styles);

  const labelRow = startRow + 1;
  const valueRow = startRow + 2;

  ws.getRow(labelRow).height = LABEL_ROW_HEIGHT;
  ws.getRow(valueRow).height = VALUE_ROW_HEIGHT;

  cards.forEach((card, i) => {
    const colStart = i * colsPerCard + 1;
    // La última card toma el resto de columnas
    const colEnd = i === cardCount - 1 ? colCount : colStart + colsPerCard - 1;

    // ── Fila de etiqueta ────────────────────────────────────────────
    ws.mergeCells(labelRow, colStart, labelRow, colEnd);
    const labelCell = ws.getCell(labelRow, colStart);
    applyStyle(labelCell, styles.summaryCardLabel);
    labelCell.value = card.label.toUpperCase();

    // Padding interno izquierdo (simulado ajustando la primera columna)
    labelCell.alignment = { horizontal: "left", vertical: "bottom", indent: 1 };

    // ── Fila de valor ────────────────────────────────────────────────
    ws.mergeCells(valueRow, colStart, valueRow, colEnd);
    const valueCell = ws.getCell(valueRow, colStart);

    const valueStyle = resolveCardValueStyle(card.type, styles);
    applyStyle(valueCell, valueStyle);

    const displayValue =
      card.unit
        ? `${formatCardValue(card.value)} ${card.unit}`
        : formatCardValue(card.value);
    valueCell.value = displayValue;
    valueCell.alignment = { horizontal: "left", vertical: "middle", indent: 1 };
  });

  // Fila de padding inferior
  const paddingBottomRow = valueRow + 1;
  ws.getRow(paddingBottomRow).height = PADDING_ROW_HEIGHT;
  fillPaddingRow(ws, paddingBottomRow, colCount, styles);

  return paddingBottomRow + 1;
}

// ── Helpers privados ───────────────────────────────────────────────────────

function resolveCardValueStyle(
  type: SummaryCardType | undefined,
  styles: StyleSet
) {
  switch (type) {
    case "warning": return styles.summaryCardWarning;
    case "danger":  return styles.summaryCardDanger;
    case "primary": return styles.summaryCardPrimary;
    default:        return styles.summaryCardValue;
  }
}

function formatCardValue(value: string | number): string {
  if (typeof value === "number") {
    return new Intl.NumberFormat("es-CL").format(value);
  }
  return String(value);
}

function fillPaddingRow(
  ws: ExcelJS.Worksheet,
  rowNumber: number,
  colCount: number,
  styles: StyleSet
): void {
  const fill = styles.summaryCardLabel.fill;
  if (!fill) return;
  for (let c = 1; c <= colCount; c++) {
    ws.getCell(rowNumber, c).fill = fill;
  }
}
