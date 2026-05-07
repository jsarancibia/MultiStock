/**
 * Tema por defecto: MultiStock Green
 * Alineado con el color primario de la aplicación (oklch(0.56 0.16 154) → verde).
 */
import type { ExcelTheme } from "./index";
import { Brand } from "../core/colors";

export const MULTISTOCK_THEME: ExcelTheme = {
  id: "multistock",
  name: "MultiStock Verde",
  colors: {
    brandBarBg: Brand.primaryFaint,  // Verde muy suave
    brandBarText: Brand.primary,     // Verde corporativo

    bgPage: Brand.bgPage,
    titleText: Brand.textPrimary,
    subtitleText: Brand.textSecondary,
    metaText: Brand.textSoft,
    bizNameText: Brand.textSecondary,

    separatorColor: Brand.primary,

    headerBg: Brand.primary,
    headerText: Brand.textWhite,
    headerBorderBottom: Brand.primaryDark,

    bgCard: Brand.bgCard,
    stripe: Brand.stripe,

    okBg: Brand.okBg,
    okText: Brand.okText,
    warnBg: Brand.warnBg,
    warnText: Brand.warnText,
    errorBg: Brand.errorBg,
    errorText: Brand.errorText,
    infoBg: Brand.infoBg,
    infoText: Brand.infoText,

    summaryBg: Brand.summaryBg,
    summaryText: Brand.textSecondary,
    summaryBorder: Brand.borderLight,
    summaryValueText: Brand.primary,

    footerBg: Brand.bgPage,
    footerText: Brand.textSoft,

    borderLight: Brand.borderLight,
    borderMid: Brand.borderMid,
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
