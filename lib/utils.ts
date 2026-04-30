import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { APP_CURRENCY, APP_LOCALE } from "@/config/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export { APP_CURRENCY, APP_LOCALE }

/** Formatea importes en moneda local (CLP por defecto). */
export function formatCurrency(
  value: number | string,
  options?: { locale?: string; currency?: string }
): string {
  const n = typeof value === "string" ? Number(value) : value
  if (!Number.isFinite(n)) return "—"
  const locale = options?.locale ?? APP_LOCALE
  const currency = options?.currency ?? APP_CURRENCY
  const isCLP = currency === "CLP"
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: isCLP ? 0 : 2,
    maximumFractionDigits: isCLP ? 0 : 2,
  }).format(n)
}

/** Formatea cantidades de stock o unidades con separadores locales. */
export function formatQuantity(
  value: number | string,
  maxDecimals: number = 4
): string {
  const n = typeof value === "string" ? Number(value) : value
  if (!Number.isFinite(n)) return "—"
  return new Intl.NumberFormat(APP_LOCALE, {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals,
  }).format(n)
}
