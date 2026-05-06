/** Reglas compartidas: ventas, carrito y movimientos de stock (cantidades decimales vs enteras). */

export const DECIMAL_QUANTITY_UNIT_TYPES = new Set<string>(["kg", "g", "liter", "meter"]);

const STOCK_COMPARE_EPSILON = 1e-9;

export function allowsDecimalQuantity(unitType: string): boolean {
  return DECIMAL_QUANTITY_UNIT_TYPES.has(unitType);
}

export function exceedsStock(quantity: number, stock: number): boolean {
  return quantity - stock > STOCK_COMPARE_EPSILON;
}

/** Alineado a numeric(14,4) en BD: entradas con paso fino sin forzar enteros en peso/medida. */
export function quantityInputConstraints(unitType: string): { min: number; step: number } {
  if (!allowsDecimalQuantity(unitType)) {
    return { min: 1, step: 1 };
  }
  return { min: 0.0001, step: 0.0001 };
}

export function unitPriceFieldLabel(unitType: string): string {
  switch (unitType) {
    case "kg":
      return "Precio / kg";
    case "g":
      return "Precio / g";
    case "liter":
      return "Precio / L";
    case "meter":
      return "Precio / m";
    default:
      return "Precio unit.";
  }
}

/** Unidad corta para el carrito (fase UI: aclarar kg vs uds.). */
export function quantityUnitAbbrev(unitType: string): string {
  switch (unitType) {
    case "kg":
      return "kg";
    case "g":
      return "g";
    case "liter":
      return "L";
    case "meter":
      return "m";
    case "box":
      return "caja";
    default:
      return "uds.";
  }
}

/** Evita valores controlados ilegibles por error de coma flotante en el input. */
export function stabilizeQuantityInputValue(quantity: number, unitType: string): number {
  if (!Number.isFinite(quantity)) return 0;
  if (!allowsDecimalQuantity(unitType)) return Math.round(quantity);
  return Math.round(quantity * 10_000) / 10_000;
}
