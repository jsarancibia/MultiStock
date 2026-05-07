/**
 * Tema: Corporate Blue
 * Inspirado en SAP Business One, Microsoft Dynamics y reportes corporativos formales.
 * Headers en azul marino profundo, datos sobre blanco limpio.
 */
import type { ExcelTheme } from "./index";

export const CORPORATE_BLUE_THEME: ExcelTheme = {
  id: "corporate-blue",
  name: "Corporate Blue",
  colors: {
    brandBarBg: "FF1F3864",       // Azul marino profundo
    brandBarText: "FFFFFFFF",     // Blanco

    bgPage: "FFEEF4FB",           // Azul muy suave (fondo header)
    titleText: "FF1F3864",        // Azul marino
    subtitleText: "FF2E5898",     // Azul medio
    metaText: "FF5B7AB4",         // Azul suave
    bizNameText: "FF2E5898",      // Azul medio

    separatorColor: "FF2E74B5",   // Azul corporativo

    headerBg: "FF2E74B5",         // Azul corporativo medio
    headerText: "FFFFFFFF",       // Blanco
    headerBorderBottom: "FF1F3864",// Azul marino

    bgCard: "FFFFFFFF",           // Blanco puro
    stripe: "FFE9F0FB",           // Azul muy suave alternado

    okBg: "FFC6EFD4",
    okText: "FF1A5C35",
    warnBg: "FFFFF2CC",
    warnText: "FF9C5700",
    errorBg: "FFFFC7CE",
    errorText: "FF9C0006",
    infoBg: "FFDAE3F3",
    infoText: "FF1F3864",

    summaryBg: "FFDCE6F1",        // Azul muy suave para cards
    summaryText: "FF2E5898",      // Azul medio
    summaryBorder: "FFBDD3EE",    // Borde azul suave
    summaryValueText: "FF1F3864", // Azul marino

    footerBg: "FFEEF4FB",         // Mismo que bgPage
    footerText: "FF5B7AB4",       // Azul suave

    borderLight: "FFD6E4F5",      // Borde azul muy suave
    borderMid: "FFA8C4E4",        // Borde azul medio
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
