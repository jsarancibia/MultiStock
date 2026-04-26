import type { BusinessType } from "@/config/business-types";
import { businessTypes } from "@/config/business-types";

/**
 * Fase 8 arquitectura3: helpers para UI y reglas segun `business_type`.
 * Los datos de negocio viven en columnas comunes + `metadata` (json) por rubro.
 */
export function getProductFocusFilterOptions(
  type: BusinessType
): { value: string; label: string }[] {
  const base = [{ value: "all", label: "Todos" }];
  if (type === "verduleria") {
    return [
      ...base,
      { value: "perishable", label: "Solo perecibles" },
    ];
  }
  if (type === "almacen") {
    return [
      ...base,
      { value: "fast_rotation", label: "Alta rotacion" },
      { value: "low_margin", label: "Margen bajo" },
    ];
  }
  if (type === "ferreteria") {
    return [
      ...base,
      { value: "stale", label: "Sin movimiento 30d" },
    ];
  }
  return base;
}

export function getRubroDashboardTitle(type: BusinessType): string {
  return businessTypes[type].label;
}

/** Margen simple sobre costo: (venta - costo) / costo * 100 */
export function marginPercentOnCost(cost: number, sale: number): number | null {
  if (cost <= 0) return null;
  return ((sale - cost) / cost) * 100;
}

export function isLowMargin(
  cost: number,
  sale: number,
  suggestedPercent: number | undefined
): boolean {
  const m = marginPercentOnCost(cost, sale);
  if (m === null) return false;
  const threshold = suggestedPercent && suggestedPercent > 0 ? suggestedPercent : 10;
  return m < threshold;
}
