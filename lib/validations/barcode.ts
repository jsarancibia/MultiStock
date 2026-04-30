import { z } from "zod";
import { isValidBarcodeFormat, normalizeBarcode } from "@/lib/barcode/normalize";

export function preprocessBarcodeField(val: unknown): string {
  if (val === undefined || val === null) return "";
  const raw = String(val);
  if (!raw.trim()) return "";
  return normalizeBarcode(raw);
}

export const barcodeFieldSchema = z.preprocess(
  preprocessBarcodeField,
  z.union([
    z.literal(""),
    z
      .string()
      .refine((s) => isValidBarcodeFormat(s), {
        message: "Código inválido: entre 6 y 32 caracteres (letras y números).",
      }),
  ])
);

export const barcodeLookupSchema = z
  .string()
  .transform((raw) => normalizeBarcode(raw.trim()))
  .pipe(
    z
      .string()
      .min(1, "Ingresá un código.")
      .refine((s) => isValidBarcodeFormat(s), {
        message: "Código inválido: entre 6 y 32 caracteres (letras y números).",
      })
  );
