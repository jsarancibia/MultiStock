/** Etiquetas en español para tipos de movimiento de stock (DB). */
export const movementTypeLabels: Record<string, string> = {
  initial_stock: "Stock inicial",
  purchase: "Compra",
  adjustment: "Ajuste",
  waste: "Merma",
  return: "Devolución",
  sale: "Venta",
};

export function movementTypeLabel(type: string): string {
  return movementTypeLabels[type] ?? type;
}
