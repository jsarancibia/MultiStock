/** Caracteres permitidos tras normalizar (formatos comerciales típicos). */
const BARCODE_BODY_REGEX = /^[A-Z0-9]{6,32}$/;

/**
 * Quita espacios/guiones, elimina caracteres invisibles comunes y pasa a mayúsculas.
 * No convierte a número: los ceros iniciales se conservan en el string.
 */
export function normalizeBarcode(value: string): string {
  const trimmed = value.trim().replace(/[\s-]/g, "");
  const noInvisible = trimmed.replace(/[\u200B-\u200D\uFEFF]/g, "");
  return noInvisible.toUpperCase();
}

export function isValidBarcodeFormat(normalized: string): boolean {
  if (!normalized) return false;
  return BARCODE_BODY_REGEX.test(normalized);
}
