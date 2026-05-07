/**
 * Helpers de formato numérico para ExcelJS.
 * Usar numFmt en lugar de formatear valores como string —
 * así Excel mantiene los números como números (filtrables, sumables).
 */

/** Moneda local sin decimales: $1.500 */
export const FMT_CURRENCY = '"$"#,##0';

/** Moneda con 2 decimales: $1.500,00 */
export const FMT_CURRENCY_DECIMAL = '"$"#,##0.00';

/** Cantidad entera: 1.500 */
export const FMT_INTEGER = "#,##0";

/** Cantidad decimal: 1.500,25 */
export const FMT_DECIMAL = "#,##0.##";

/** Porcentaje: 12,50% */
export const FMT_PERCENT = '0.00"%"';

/** Fecha corta: 31/12/2024 */
export const FMT_DATE = "dd/mm/yyyy";

/** Fecha con hora: 31/12/2024 14:30 */
export const FMT_DATETIME = "dd/mm/yyyy hh:mm";

/**
 * Retorna el numFmt adecuado para un tipo de columna.
 * Compatible con ExcelJS `cell.numFmt`.
 */
export function numFmtFor(
  type: "currency" | "number" | "date" | "datetime" | "percent" | "text"
): string | undefined {
  switch (type) {
    case "currency":
      return FMT_CURRENCY;
    case "number":
      return FMT_DECIMAL;
    case "date":
      return FMT_DATE;
    case "datetime":
      return FMT_DATETIME;
    case "percent":
      return FMT_PERCENT;
    default:
      return undefined;
  }
}

/**
 * Formatea una fecha como string legible en español (para usar en metadatos, no en celdas de datos).
 */
export function formatExportDate(date: Date): string {
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
