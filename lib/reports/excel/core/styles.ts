/**
 * Sistema centralizado de estilos para reportes Excel.
 * TODOS los generators deben importar estilos desde aquí.
 * Nunca repetir estilos inline en otros archivos.
 *
 * Para soporte de temas:
 *   import { createStyleSet } from "./styles";
 *   import { resolveTheme } from "../themes";
 *   const styles = createStyleSet(resolveTheme("corporate-blue"));
 */
import type ExcelJS from "exceljs";
import { Brand } from "./colors";
import type { ExcelTheme } from "../themes/index";

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
 * Versión legacy: usa los estilos estáticos (sin tema).
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

// ── Sistema de StyleSet con soporte de temas ──────────────────────────────

/**
 * Crea un conjunto completo de estilos derivado de un tema.
 * Usar en workbook.ts para propagar el tema a todos los módulos de rendering.
 *
 * @example
 *   const styles = createStyleSet(resolveTheme("corporate-blue"));
 *   applyBrandHeader(ws, ctx, colCount, logoId, styles);
 *   applyTableHeader(ws, columns, row, styles);
 */
export function createStyleSet(theme: ExcelTheme) {
  const sf = (argb: string): ExcelJS.Fill => ({
    type: "pattern",
    pattern: "solid",
    fgColor: { argb },
  });

  const base = (
    size?: number,
    color?: string,
    bold?: boolean,
    italic?: boolean
  ): Partial<ExcelJS.Font> => ({
    name: theme.fonts.base,
    size: size ?? theme.fonts.dataSize,
    color: { argb: color ?? theme.colors.titleText },
    bold: bold ?? false,
    italic: italic ?? false,
  });

  return {
    brandBar: {
      font: base(theme.fonts.headerSize + 3, theme.colors.brandBarText, true),
      fill: sf(theme.colors.brandBarBg),
      alignment: { horizontal: "center" as const, vertical: "middle" as const },
    } satisfies CellStyle,

    title: {
      font: base(theme.fonts.titleSize, theme.colors.titleText, true),
      fill: sf(theme.colors.bgPage),
      alignment: { horizontal: "left" as const, vertical: "middle" as const },
    } satisfies CellStyle,

    subtitle: {
      font: base(theme.fonts.metaSize, theme.colors.subtitleText, false, true),
      fill: sf(theme.colors.bgPage),
      alignment: { horizontal: "left" as const, vertical: "middle" as const },
    } satisfies CellStyle,

    meta: {
      font: base(theme.fonts.metaSize, theme.colors.metaText),
      fill: sf(theme.colors.bgPage),
      alignment: { horizontal: "right" as const, vertical: "middle" as const },
    } satisfies CellStyle,

    bizName: {
      font: base(theme.fonts.dataSize, theme.colors.bizNameText, true),
      fill: sf(theme.colors.bgPage),
      alignment: { horizontal: "right" as const, vertical: "middle" as const },
    } satisfies CellStyle,

    tableHeader: {
      font: base(theme.fonts.headerSize, theme.colors.headerText, true),
      fill: sf(theme.colors.headerBg),
      alignment: { horizontal: "center" as const, vertical: "middle" as const, wrapText: true },
      border: {
        bottom: { style: "medium" as const, color: { argb: theme.colors.headerBorderBottom } },
      },
    } satisfies CellStyle,

    dataLeft: {
      font: base(),
      fill: sf(theme.colors.bgCard),
      alignment: { horizontal: "left" as const, vertical: "middle" as const },
    } satisfies CellStyle,

    dataCenter: {
      font: base(),
      fill: sf(theme.colors.bgCard),
      alignment: { horizontal: "center" as const, vertical: "middle" as const },
    } satisfies CellStyle,

    dataRight: {
      font: base(),
      fill: sf(theme.colors.bgCard),
      alignment: { horizontal: "right" as const, vertical: "middle" as const },
    } satisfies CellStyle,

    dataCurrency: {
      font: base(),
      fill: sf(theme.colors.bgCard),
      alignment: { horizontal: "right" as const, vertical: "middle" as const },
      numFmt: '"$"#,##0',
    } satisfies CellStyle,

    dataQuantity: {
      font: base(),
      fill: sf(theme.colors.bgCard),
      alignment: { horizontal: "right" as const, vertical: "middle" as const },
      numFmt: "#,##0.##",
    } satisfies CellStyle,

    dataDate: {
      font: base(),
      fill: sf(theme.colors.bgCard),
      alignment: { horizontal: "left" as const, vertical: "middle" as const },
      numFmt: "dd/mm/yyyy",
    } satisfies CellStyle,

    dataDatetime: {
      font: base(),
      fill: sf(theme.colors.bgCard),
      alignment: { horizontal: "left" as const, vertical: "middle" as const },
      numFmt: "dd/mm/yyyy hh:mm",
    } satisfies CellStyle,

    stripe: {
      fill: sf(theme.colors.stripe),
    } as Pick<CellStyle, "fill">,

    statusAlert: {
      font: base(undefined, theme.colors.errorText, true),
      fill: sf(theme.colors.errorBg),
      alignment: { horizontal: "center" as const, vertical: "middle" as const },
    } satisfies CellStyle,

    statusOk: {
      font: base(undefined, theme.colors.okText),
      fill: sf(theme.colors.okBg),
      alignment: { horizontal: "center" as const, vertical: "middle" as const },
    } satisfies CellStyle,

    statusWarn: {
      font: base(undefined, theme.colors.warnText),
      fill: sf(theme.colors.warnBg),
      alignment: { horizontal: "center" as const, vertical: "middle" as const },
    } satisfies CellStyle,

    statusInfo: {
      font: base(undefined, theme.colors.infoText),
      fill: sf(theme.colors.infoBg),
      alignment: { horizontal: "center" as const, vertical: "middle" as const },
    } satisfies CellStyle,

    kpiLabel: {
      font: base(theme.fonts.metaSize, theme.colors.summaryText, true),
      fill: sf(theme.colors.summaryBg),
      alignment: { horizontal: "left" as const, vertical: "middle" as const },
    } satisfies CellStyle,

    kpiValue: {
      font: base(12, theme.colors.summaryValueText, true),
      fill: sf(theme.colors.summaryBg),
      alignment: { horizontal: "right" as const, vertical: "middle" as const },
    } satisfies CellStyle,

    summaryCardLabel: {
      font: base(theme.fonts.metaSize - 1, theme.colors.summaryText),
      fill: sf(theme.colors.summaryBg),
      alignment: { horizontal: "left" as const, vertical: "bottom" as const },
    } satisfies CellStyle,

    summaryCardValue: {
      font: base(14, theme.colors.summaryValueText, true),
      fill: sf(theme.colors.summaryBg),
      alignment: { horizontal: "left" as const, vertical: "top" as const },
    } satisfies CellStyle,

    summaryCardPrimary: {
      font: base(14, theme.colors.summaryValueText, true),
      fill: sf(theme.colors.summaryBg),
      alignment: { horizontal: "left" as const, vertical: "top" as const },
      border: { left: { style: "medium" as const, color: { argb: theme.colors.summaryValueText } } },
    } satisfies CellStyle,

    summaryCardWarning: {
      font: base(14, theme.colors.warnText, true),
      fill: sf(theme.colors.summaryBg),
      alignment: { horizontal: "left" as const, vertical: "top" as const },
      border: { left: { style: "medium" as const, color: { argb: theme.colors.warnText } } },
    } satisfies CellStyle,

    summaryCardDanger: {
      font: base(14, theme.colors.errorText, true),
      fill: sf(theme.colors.summaryBg),
      alignment: { horizontal: "left" as const, vertical: "top" as const },
      border: { left: { style: "medium" as const, color: { argb: theme.colors.errorText } } },
    } satisfies CellStyle,

    footer: {
      font: base(theme.fonts.metaSize, theme.colors.footerText, false, true),
      fill: sf(theme.colors.footerBg),
      alignment: { horizontal: "center" as const, vertical: "middle" as const },
    } satisfies CellStyle,

    footerMeta: {
      font: base(theme.fonts.metaSize - 1, theme.colors.footerText),
      fill: sf(theme.colors.footerBg),
      alignment: { horizontal: "left" as const, vertical: "middle" as const },
    } satisfies CellStyle,
  };
}

/** Tipo derivado del StyleSet generado por createStyleSet */
export type StyleSet = ReturnType<typeof createStyleSet>;

/** StyleSet por defecto usando el tema MultiStock (verde corporativo) */
import { MULTISTOCK_THEME } from "../themes/multistock";
export const DEFAULT_STYLE_SET: StyleSet = createStyleSet(MULTISTOCK_THEME);
