/**
 * Sistema de temas (themes) para el motor de reportes Excel.
 *
 * Cada theme define la paleta de colores, tipografía y propiedades visuales
 * que el engine utiliza para renderizar headers, tablas, cards y footers.
 *
 * Uso:
 *   buildReportBuffer(ctx, { theme: "corporate-blue", ... })
 *   buildReportBuffer(ctx, { theme: myCustomTheme, ... })   // theme personalizado
 */

// ── Interfaces públicas ────────────────────────────────────────────────────

export type ThemeColors = {
  // Barra de marca (row 1)
  brandBarBg: string;
  brandBarText: string;

  // Zona de título y metadata (rows 2-3)
  bgPage: string;
  titleText: string;
  subtitleText: string;
  metaText: string;
  bizNameText: string;

  // Separador visual
  separatorColor: string;

  // Encabezado de tabla
  headerBg: string;
  headerText: string;
  headerBorderBottom: string;

  // Celdas de datos
  bgCard: string;
  stripe: string;

  // Estados semánticos
  okBg: string;
  okText: string;
  warnBg: string;
  warnText: string;
  errorBg: string;
  errorText: string;
  infoBg: string;
  infoText: string;

  // Summary cards
  summaryBg: string;
  summaryText: string;
  summaryBorder: string;
  summaryValueText: string;

  // Footer
  footerBg: string;
  footerText: string;

  // Bordes
  borderLight: string;
  borderMid: string;
};

export type ThemeFonts = {
  /** Fuente para texto de datos (Calibri, Arial...) */
  base: string;
  /** Fuente para títulos (puede ser la misma que base) */
  heading: string;
  /** Tamaño del título del reporte */
  titleSize: number;
  /** Tamaño del encabezado de columna */
  headerSize: number;
  /** Tamaño de las celdas de datos */
  dataSize: number;
  /** Tamaño de texto de metadatos y footer */
  metaSize: number;
};

/** Definición completa de un tema visual */
export type ExcelTheme = {
  id: string;
  name: string;
  colors: ThemeColors;
  fonts: ThemeFonts;
};

/** IDs de temas predefinidos */
export type ThemeId =
  | "multistock"
  | "corporate-blue"
  | "dark-professional"
  | "minimal-gray";

// ── Registro de temas ──────────────────────────────────────────────────────

import { MULTISTOCK_THEME } from "./multistock";
import { CORPORATE_BLUE_THEME } from "./corporate-blue";
import { DARK_PROFESSIONAL_THEME } from "./dark-professional";
import { MINIMAL_GRAY_THEME } from "./minimal-gray";

export const THEMES: Record<ThemeId, ExcelTheme> = {
  "multistock": MULTISTOCK_THEME,
  "corporate-blue": CORPORATE_BLUE_THEME,
  "dark-professional": DARK_PROFESSIONAL_THEME,
  "minimal-gray": MINIMAL_GRAY_THEME,
};

/**
 * Resuelve un ThemeId, un objeto ExcelTheme, o undefined al tema correcto.
 * Si el id no existe, usa el tema por defecto (multistock).
 */
export function resolveTheme(id?: ThemeId | ExcelTheme | null): ExcelTheme {
  if (!id) return MULTISTOCK_THEME;
  if (typeof id === "object") return id;
  return THEMES[id] ?? MULTISTOCK_THEME;
}

export { MULTISTOCK_THEME, CORPORATE_BLUE_THEME, DARK_PROFESSIONAL_THEME, MINIMAL_GRAY_THEME };
