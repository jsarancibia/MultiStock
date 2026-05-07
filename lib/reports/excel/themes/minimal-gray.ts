/**
 * Tema: Minimal Gray
 * Diseño limpio y mínimo, inspirado en Google Sheets, Notion y herramientas modernas.
 * Headers grises neutros, sin colores llamativos, máxima legibilidad.
 */
import type { ExcelTheme } from "./index";

export const MINIMAL_GRAY_THEME: ExcelTheme = {
  id: "minimal-gray",
  name: "Minimal Gray",
  colors: {
    brandBarBg: "FFF1F3F4",       // Gris muy claro
    brandBarText: "FF202124",     // Casi negro

    bgPage: "FFFFFFFF",           // Blanco puro
    titleText: "FF202124",        // Casi negro
    subtitleText: "FF5F6368",     // Gris medio
    metaText: "FF9AA0A6",         // Gris suave
    bizNameText: "FF5F6368",      // Gris medio

    separatorColor: "FFDADCE0",   // Gris claro (separador sutil)

    headerBg: "FF5F6368",         // Gris medio oscuro
    headerText: "FFFFFFFF",       // Blanco
    headerBorderBottom: "FF3C4043",// Gris oscuro

    bgCard: "FFFFFFFF",           // Blanco puro
    stripe: "FFF8F9FA",           // Gris casi blanco

    okBg: "FFC6EFD4",
    okText: "FF276221",
    warnBg: "FFFFF2CC",
    warnText: "FF9C5700",
    errorBg: "FFFFC7CE",
    errorText: "FF9C0006",
    infoBg: "FFDAE3F3",
    infoText: "FF1F3864",

    summaryBg: "FFF1F3F4",        // Gris muy claro
    summaryText: "FF5F6368",      // Gris medio
    summaryBorder: "FFE8EAED",    // Borde gris suave
    summaryValueText: "FF3C4043", // Gris oscuro

    footerBg: "FFF8F9FA",         // Gris casi blanco
    footerText: "FF9AA0A6",       // Gris suave

    borderLight: "FFE8EAED",      // Borde muy suave
    borderMid: "FFDADCE0",        // Borde medio
  },
  fonts: {
    base: "Calibri",
    heading: "Calibri",
    titleSize: 18,
    headerSize: 10,
    dataSize: 10,
    metaSize: 9,
  },
};
