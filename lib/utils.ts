import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const DEFAULT_LOCALE = "es-AR"
const DEFAULT_CURRENCY = "ARS"

/** Formatea importes en moneda local (ARS). */
export function formatCurrency(
  value: number | string,
  options?: { locale?: string; currency?: string }
): string {
  const n = typeof value === "string" ? Number(value) : value
  if (!Number.isFinite(n)) return "—"
  const locale = options?.locale ?? DEFAULT_LOCALE
  const currency = options?.currency ?? DEFAULT_CURRENCY
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)
}

/** Formatea cantidades de stock o unidades con separadores locales. */
export function formatQuantity(
  value: number | string,
  maxDecimals: number = 4
): string {
  const n = typeof value === "string" ? Number(value) : value
  if (!Number.isFinite(n)) return "—"
  return new Intl.NumberFormat(DEFAULT_LOCALE, {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals,
  }).format(n)
}
