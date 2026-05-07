/**
 * Tema: Dark Professional
 * Headers oscuros estilo charcoal, datos sobre fondo claro.
 * Inspirado en dashboards modernos de SaaS (Vercel, Linear, GitHub).
 * NO es "dark mode" completo — los datos van sobre blanco para mejor legibilidad de impresión.
 */
import type { ExcelTheme } from "./index";

export const DARK_PROFESSIONAL_THEME: ExcelTheme = {
  id: "dark-professional",
  name: "Dark Professional",
  colors: {
    brandBarBg: "FF1A202C",       // Charcoal muy oscuro
    brandBarText: "FFFFFFFF",     // Blanco

    bgPage: "FFF7FAFC",           // Casi blanco (fondo header)
    titleText: "FF1A202C",        // Charcoal
    subtitleText: "FF4A5568",     // Gris slate
    metaText: "FF718096",         // Gris medio
    bizNameText: "FF4A5568",      // Gris slate

    separatorColor: "FF4A5568",   // Gris slate

    headerBg: "FF2D3748",         // Charcoal medio
    headerText: "FFFFFFFF",       // Blanco
    headerBorderBottom: "FF1A202C",// Charcoal oscuro

    bgCard: "FFFFFFFF",           // Blanco puro
    stripe: "FFF0F4F8",           // Gris muy suave alternado

    okBg: "FFC6EFD4",
    okText: "FF1A5C35",
    warnBg: "FFFFF2CC",
    warnText: "FF9C5700",
    errorBg: "FFFFC7CE",
    errorText: "FF9C0006",
    infoBg: "FFE2E8F0",
    infoText: "FF2D3748",

    summaryBg: "FFE2E8F0",        // Gris azulado suave
    summaryText: "FF4A5568",      // Gris slate
    summaryBorder: "FFCBD5E0",    // Borde gris suave
    summaryValueText: "FF2D3748", // Charcoal medio

    footerBg: "FFF7FAFC",         // Igual que bgPage
    footerText: "FF718096",       // Gris medio

    borderLight: "FFE2E8F0",      // Borde muy suave
    borderMid: "FFCBD5E0",        // Borde medio
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
