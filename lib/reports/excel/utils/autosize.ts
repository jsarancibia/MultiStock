/**
 * Helpers para calcular anchos de columna óptimos.
 * Los anchos se definen MANUALMENTE en cada ReportColumn para consistencia,
 * pero este helper puede calcular un ancho mínimo razonable a partir del contenido.
 */

/** Ancho mínimo en caracteres para cualquier columna */
const MIN_WIDTH = 8;

/** Ancho máximo en caracteres para evitar columnas demasiado anchas */
const MAX_WIDTH = 60;

/** Margen de padding visual añadido al ancho calculado */
const PADDING = 2;

/**
 * Estima el ancho óptimo de una columna basándose en el header y los valores de muestra.
 * Devuelve un número en unidades de ExcelJS (aprox. caracteres de ancho).
 *
 * @param header - Texto del encabezado de la columna
 * @param values - Muestra de valores de la columna (hasta 20 filas)
 * @param definedWidth - Ancho definido manualmente (si existe, tiene precedencia)
 */
export function estimateColumnWidth(
  header: string,
  values: Array<string | number | Date | null | undefined>,
  definedWidth?: number
): number {
  if (definedWidth != null && definedWidth > 0) return definedWidth;

  const headerLen = header.length;
  const maxValueLen = values.slice(0, 20).reduce<number>((max, val) => {
    const len = String(val ?? "").length;
    return len > max ? len : max;
  }, 0);

  const calculated = Math.max(headerLen, maxValueLen) + PADDING;
  return Math.min(Math.max(calculated, MIN_WIDTH), MAX_WIDTH);
}

/**
 * Aplica los anchos calculados o definidos a las columnas de una hoja.
 *
 * @param ws - Worksheet de ExcelJS
 * @param columns - Array de definiciones de columna con `width` opcional
 * @param sampleRows - Filas de muestra para calcular anchos automáticos
 */
export function applyColumnWidths(
  ws: import("exceljs").Worksheet,
  columns: Array<{ key: string; header: string; width?: number }>,
  sampleRows: Array<Record<string, string | number | Date | null | undefined>>
): void {
  columns.forEach((col, idx) => {
    const colValues = sampleRows.map((row) => row[col.key]);
    const width = estimateColumnWidth(col.header, colValues, col.width);
    ws.getColumn(idx + 1).width = width;
  });
}
