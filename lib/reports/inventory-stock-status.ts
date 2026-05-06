export type InventarioEstadoCalculado =
  | "OK"
  | "Stock bajo"
  | "Stock crítico"
  | "Sin mínimo definido";

export function inventarioEstadoCalculado(actual: number, min: number): InventarioEstadoCalculado {
  if (!Number.isFinite(actual)) return "Sin mínimo definido";
  const nMin = Number(min);
  if (!Number.isFinite(nMin) || nMin <= 0) return "Sin mínimo definido";
  if (actual <= 0) return "Stock crítico";
  if (actual < nMin) return "Stock bajo";
  return "OK";
}

export function inventarioSolicitarEtiqueta(actual: number, min: number): string {
  const nMin = Number(min);
  if (!Number.isFinite(nMin) || nMin <= 0) return "Sin dato stock mínimo";
  if (!Number.isFinite(actual)) return "Sin dato inventario";
  if (actual >= nMin) return "Hay suficiente";
  return "Solicitar material";
}
