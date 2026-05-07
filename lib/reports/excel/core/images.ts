/**
 * Helper para cargar e incrustar el logo corporativo en workbooks de ExcelJS.
 *
 * El logo DEBE:
 * - Estar en formato PNG o JPEG
 * - Tener tamaño fijo (no libre/flotante)
 * - Anclarse correctamente al header (tl/ext con píxeles fijos)
 *
 * Si no hay logo disponible, las funciones fallan silenciosamente
 * para no romper la generación del reporte.
 */
import path from "path";
import fs from "fs";
import type ExcelJS from "exceljs";

/** Ruta al logo PNG corporativo (relativa al proceso de Node.js) */
const LOGO_PATH = path.join(process.cwd(), "public", "logo.png");

/**
 * Intenta cargar el logo desde el filesystem y lo registra en el workbook.
 * Retorna el logoId si fue cargado correctamente, o undefined si no hay logo.
 */
export async function registerLogoInWorkbook(
  workbook: ExcelJS.Workbook
): Promise<number | undefined> {
  try {
    if (!fs.existsSync(LOGO_PATH)) return undefined;
    // Buffer.from() resuelve la incompatibilidad entre Buffer<ArrayBufferLike> (@types/node ≥22)
    // y el Buffer sin genérico que espera ExcelJS
    const raw = await fs.promises.readFile(LOGO_PATH);
    const logoBuffer = Buffer.from(raw);
    return workbook.addImage({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      buffer: logoBuffer as any,
      extension: "png",
    });
  } catch {
    return undefined;
  }
}

/**
 * Parámetros para incrustar el logo en una hoja.
 */
export type LogoPlacementOptions = {
  /** LogoId retornado por registerLogoInWorkbook */
  logoId: number;
  /** Columna izquierda del anchor (índice fraccionario de celda, ej. 0.1) */
  colOffset?: number;
  /** Fila superior del anchor (índice fraccionario de celda, ej. 0.1) */
  rowOffset?: number;
  /** Ancho en píxeles */
  widthPx?: number;
  /** Alto en píxeles */
  heightPx?: number;
};

/**
 * Incrusta el logo en una hoja de Excel con posición y tamaño fijos.
 * El logo queda anclado a la esquina superior izquierda del header.
 *
 * Usa siempre tamaño fijo (ext) para evitar el efecto "imagen flotante".
 */
export function placeLogoInSheet(
  ws: ExcelJS.Worksheet,
  opts: LogoPlacementOptions
): void {
  const {
    logoId,
    colOffset = 0.12,
    rowOffset = 0.1,
    widthPx = 60,
    heightPx = 36,
  } = opts;

  ws.addImage(logoId, {
    tl: { col: colOffset, row: rowOffset },
    ext: { width: widthPx, height: heightPx },
  });
}
