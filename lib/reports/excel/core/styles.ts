/**
 * Sistema centralizado de estilos para reportes Excel.
 * TODOS los generators deben importar estilos desde aquí.
 * Nunca repetir estilos inline en otros archivos.
 */
import type ExcelJS from "exceljs";
import { Brand } from "./colors";

// ── Tipo local para mayor comodidad ────────────────────────────────────────
export type CellStyle = {
  font?: Partial<ExcelJS.Font>;
  fill?: ExcelJS.Fill;
  alignment?: Partial<ExcelJS.Alignment>;
  border?: Partial<ExcelJS.Borders>;
  numFmt?: string;
};

// ── Base de fuente ──────────────────────────────────────────────────────────
const baseFont: Partial<ExcelJS.Font> = {
  name: "Calibri",
  size: 10,
  color: { argb: Brand.textPrimary },
};

const solidFill = (argb: string): ExcelJS.Fill => ({
  type: "pattern",
  pattern: "solid",
  fgColor: { argb },
});

// ── Estilos de zona de marca (header corporativo) ──────────────────────────

/** Barra superior de marca: "MultiStock" */
export const brandBarStyle: CellStyle = {
  font: { ...baseFont, bold: true, size: 13, color: { argb: Brand.primary } },
  fill: solidFill(Brand.primaryFaint),
  alignment: { horizontal: "center", vertical: "middle" },
};

/** Título principal del reporte */
export const titleStyle: CellStyle = {
  font: { ...baseFont, bold: true, size: 18, color: { argb: Brand.textPrimary } },
  fill: solidFill(Brand.bgPage),
  alignment: { horizontal: "left", vertical: "middle" },
};

/** Subtítulo / descripción del reporte */
export const subtitleStyle: CellStyle = {
  font: { ...baseFont, size: 10, italic: true, color: { argb: Brand.textSecondary } },
  fill: solidFill(Brand.bgPage),
  alignment: { horizontal: "left", vertical: "middle" },
};

/** Metadatos pequeños: fecha, negocio, etc. */
export const metaStyle: CellStyle = {
  font: { ...baseFont, size: 9, color: { argb: Brand.textSoft } },
  fill: solidFill(Brand.bgPage),
  alignment: { horizontal: "right", vertical: "middle" },
};

/** Celda de nombre de negocio (alineada derecha en header) */
export const bizNameStyle: CellStyle = {
  font: { ...baseFont, size: 10, bold: true, color: { argb: Brand.textSecondary } },
  fill: solidFill(Brand.bgPage),
  alignment: { horizontal: "right", vertical: "middle" },
};

// ── Estilos de tabla de datos ──────────────────────────────────────────────

/** Encabezado de columna: fondo verde corporativo, texto blanco */
export const headerStyle: CellStyle = {
  font: { ...baseFont, bold: true, size: 10, color: { argb: Brand.textWhite } },
  fill: solidFill(Brand.primary),
  alignment: { horizontal: "center", vertical: "middle", wrapText: true },
  border: {
    bottom: { style: "medium", color: { argb: Brand.primaryDark } },
  },
};

/** Fila de datos: alineación izquierda */
export const leftStyle: CellStyle = {
  font: { ...baseFont },
  fill: solidFill(Brand.bgCard),
  alignment: { horizontal: "left", vertical: "middle" },
};

/** Fila de datos: alineación central */
export const centeredStyle: CellStyle = {
  font: { ...baseFont },
  fill: solidFill(Brand.bgCard),
  alignment: { horizontal: "center", vertical: "middle" },
};

/** Fila de datos: alineación derecha */
export const rightStyle: CellStyle = {
  font: { ...baseFont },
  fill: solidFill(Brand.bgCard),
  alignment: { horizontal: "right", vertical: "middle" },
};

/** Celda de moneda: número con símbolo */
export const currencyStyle: CellStyle = {
  font: { ...baseFont },
  fill: solidFill(Brand.bgCard),
  alignment: { horizontal: "right", vertical: "middle" },
  numFmt: '"$"#,##0',
};

/** Celda de cantidad numérica */
export const quantityStyle: CellStyle = {
  font: { ...baseFont },
  fill: solidFill(Brand.bgCard),
  alignment: { horizontal: "right", vertical: "middle" },
  numFmt: "#,##0.##",
};

/** Celda de fecha */
export const dateStyle: CellStyle = {
  font: { ...baseFont },
  fill: solidFill(Brand.bgCard),
  alignment: { horizontal: "left", vertical: "middle" },
  numFmt: "dd/mm/yyyy",
};

/** Celda de fecha con hora */
export const datetimeStyle: CellStyle = {
  font: { ...baseFont },
  fill: solidFill(Brand.bgCard),
  alignment: { horizontal: "left", vertical: "middle" },
  numFmt: "dd/mm/yyyy hh:mm",
};

// ── Estilos de estado (semánticos) ─────────────────────────────────────────

/** Stock bajo / crítico */
export const stockAlertStyle: CellStyle = {
  font: { ...baseFont, bold: true, color: { argb: Brand.errorText } },
  fill: solidFill(Brand.errorBg),
  alignment: { horizontal: "center", vertical: "middle" },
};

/** Stock saludable / normal */
export const stockOkStyle: CellStyle = {
  font: { ...baseFont, color: { argb: Brand.okText } },
  fill: solidFill(Brand.okBg),
  alignment: { horizontal: "center", vertical: "middle" },
};

/** Stock en advertencia */
export const stockWarnStyle: CellStyle = {
  font: { ...baseFont, color: { argb: Brand.warnText } },
  fill: solidFill(Brand.warnBg),
  alignment: { horizontal: "center", vertical: "middle" },
};

/** Estado informativo / neutro */
export const infoStyle: CellStyle = {
  font: { ...baseFont, color: { argb: Brand.infoText } },
  fill: solidFill(Brand.infoBg),
  alignment: { horizontal: "center", vertical: "middle" },
};

// ── Filas alternadas ───────────────────────────────────────────────────────

/** Fondo de fila par (alternado) — se aplica encima del estilo base */
export const stripeOverlay: Pick<CellStyle, "fill"> = {
  fill: solidFill(Brand.stripe),
};

// ── Estilos de resumen / KPI ──────────────────────────────────────────────

/** Etiqueta de KPI */
export const kpiLabelStyle: CellStyle = {
  font: { ...baseFont, bold: true, size: 9, color: { argb: Brand.textSecondary } },
  fill: solidFill(Brand.summaryBg),
  alignment: { horizontal: "left", vertical: "middle" },
};

/** Valor de KPI */
export const kpiValueStyle: CellStyle = {
  font: { ...baseFont, bold: true, size: 12, color: { argb: Brand.primary } },
  fill: solidFill(Brand.summaryBg),
  alignment: { horizontal: "right", vertical: "middle" },
};

// ── Helper: aplicar estilo a una celda ─────────────────────────────────────

/**
 * Aplica un CellStyle a una celda de ExcelJS de forma segura.
 * Solo sobreescribe las propiedades definidas en el estilo.
 */
export function applyStyle(cell: ExcelJS.Cell, style: CellStyle): void {
  if (style.font) cell.font = { ...cell.font, ...style.font };
  if (style.fill) cell.fill = style.fill;
  if (style.alignment) cell.alignment = { ...cell.alignment, ...style.alignment };
  if (style.numFmt) cell.numFmt = style.numFmt;
  if (style.border) cell.border = { ...cell.border, ...style.border };
}

/**
 * Dado un tipo semántico de columna, retorna el estilo de celda base correspondiente.
 */
export function styleForColumnType(
  type: "text" | "number" | "currency" | "date" | "datetime" | "status" | undefined,
  align: "left" | "center" | "right" | undefined
): CellStyle {
  if (type === "currency") return currencyStyle;
  if (type === "number") return quantityStyle;
  if (type === "date") return dateStyle;
  if (type === "datetime") return datetimeStyle;
  if (align === "center") return centeredStyle;
  if (align === "right") return rightStyle;
  return leftStyle;
}
