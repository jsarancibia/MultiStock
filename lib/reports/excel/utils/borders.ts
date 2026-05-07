/**
 * Helpers de borde para ExcelJS.
 * Centraliza los estilos de borde usados en tablas y encabezados.
 * NUNCA usar bordes excesivos (4 lados en cada celda de datos).
 */
import type ExcelJS from "exceljs";
import { Brand } from "../core/colors";

/** Borde inferior suave (separador visual entre filas) */
export const bottomSubtle: Partial<ExcelJS.Borders> = {
  bottom: { style: "hair", color: { argb: Brand.borderLight } },
};

/** Borde inferior medio (bajo el header de tabla) */
export const bottomMedium: Partial<ExcelJS.Borders> = {
  bottom: { style: "medium", color: { argb: Brand.primaryDark } },
};

/** Borde completo suave (para celdas de resumen/KPI) */
export const allSubtle: Partial<ExcelJS.Borders> = {
  top: { style: "thin", color: { argb: Brand.borderLight } },
  left: { style: "thin", color: { argb: Brand.borderLight } },
  bottom: { style: "thin", color: { argb: Brand.borderLight } },
  right: { style: "thin", color: { argb: Brand.borderLight } },
};

/** Borde inferior de separador de marca (línea verde corporativa) */
export const brandSeparator: Partial<ExcelJS.Borders> = {
  bottom: { style: "thin", color: { argb: Brand.primary } },
};

/** Sin borde (reset) */
export const noBorder: Partial<ExcelJS.Borders> = {};

/**
 * Aplica borde inferior suave a todas las celdas de una fila de datos.
 * Usar con moderación — solo cuando el diseño lo requiera explícitamente.
 */
export function applyRowBottomBorder(
  row: ExcelJS.Row,
  colCount: number,
  border: Partial<ExcelJS.Borders> = bottomSubtle
): void {
  for (let c = 1; c <= colCount; c++) {
    const cell = row.getCell(c);
    cell.border = { ...cell.border, ...border };
  }
}
