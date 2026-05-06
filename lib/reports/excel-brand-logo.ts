import fs from "node:fs";
import path from "node:path";

export type ExcelLogoAsset = { buffer: Buffer; extension: "jpeg" | "png" };

const CANDIDATES: Array<{ rel: string; extension: "jpeg" | "png" }> = [
  { rel: "public/logo-light.jpg", extension: "jpeg" },
  { rel: "public/logo-dark.jpg", extension: "jpeg" },
  { rel: "public/brand/logos/multistock-logo-light.jpg", extension: "jpeg" },
  { rel: "public/brand/logos/multistock-logo-dark.jpg", extension: "jpeg" },
];

/** Logo raster para incrustar en Excel (ExcelJS no admite SVG). */
export function loadExcelBrandLogo(): ExcelLogoAsset | null {
  const root = process.cwd();
  for (const { rel, extension } of CANDIDATES) {
    const full = path.join(root, rel);
    if (!fs.existsSync(full)) continue;
    const buffer = fs.readFileSync(full);
    if (!buffer.length) continue;
    return { buffer, extension };
  }
  return null;
}
