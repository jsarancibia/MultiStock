/**
 * Paleta de colores corporativa en formato ARGB para ExcelJS.
 * Alineada con el tema de la aplicación (primary: oklch(0.56 0.16 154) → verde).
 *
 * Formato ExcelJS: "AARRGGBB" (AA = opacidad en hex, siempre FF para sólido)
 */
export const Brand = {
  // ── Verde corporativo (derivado de oklch(0.56 0.16 154)) ──────────────
  primary: "FF2E7C51",       // Verde principal — encabezados de tabla
  primaryDark: "FF1C5537",   // Verde oscuro — bordes de encabezado, acentos fuertes
  primaryLight: "FF4A9B6F",  // Verde claro — hover, acento secundario
  primaryFaint: "FFE8F4ED",  // Verde muy suave — fondo de brand bar, separadores

  // ── Fondos y superficies ──────────────────────────────────────────────
  bgPage: "FFF9F9F5",        // Fondo general de celda vacía (cálido, casi blanco)
  bgCard: "FFFFFFFF",        // Blanco puro para celdas de datos
  stripe: "FFF2EFEA",        // Fondo fila alternada (gris cálido suave)
  summaryBg: "FFECF5F0",     // Fondo sección resumen/KPI

  // ── Texto ─────────────────────────────────────────────────────────────
  textPrimary: "FF282420",   // Texto principal (warm dark — oklch(0.18 0.012 65))
  textSecondary: "FF4A4540", // Texto secundario
  textSoft: "FF78736C",      // Texto suave / muted-foreground
  textWhite: "FFFFFFFF",     // Texto sobre fondo oscuro

  // ── Bordes ────────────────────────────────────────────────────────────
  borderLight: "FFE0DDD5",   // Borde muy suave (oklch(0.89 0.014 80))
  borderMid: "FFCAC6BF",     // Borde intermedio
  borderStrong: "FF9A9490",  // Borde visible sin agresividad

  // ── Estados semánticos ────────────────────────────────────────────────
  okBg: "FFC6EFD4",          // Stock / estado correcto — fondo
  okText: "FF1A5C35",        // Stock / estado correcto — texto
  warnBg: "FFFFF2CC",        // Alerta / advertencia — fondo
  warnText: "FF9C5700",      // Alerta / advertencia — texto
  errorBg: "FFFFC7CE",       // Error / stock crítico — fondo
  errorText: "FF9C0006",     // Error / stock crítico — texto
  infoBg: "FFDAE3F3",        // Info neutral — fondo
  infoText: "FF1F3864",      // Info neutral — texto
} as const;

export type BrandKey = keyof typeof Brand;
export type ArgbColor = (typeof Brand)[BrandKey];
