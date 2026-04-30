import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import type { LowStockPreviewRow } from "@/lib/business/dashboard-metrics";
import { formatQuantity } from "@/lib/utils";

type LowStockPanelProps = {
  rows: LowStockPreviewRow[];
  totalLow: number;
};

export function LowStockPanel({ rows, totalLow }: LowStockPanelProps) {
  if (!totalLow) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        No hay productos en alerta de stock mínimo.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        {totalLow} producto(s) con stock actual en o por debajo del mínimo. Mostramos el {rows.length}{" "}
        más urgente.
      </p>
      <ul className="space-y-2">
        {rows.map((r) => (
          <li
            key={r.id}
            className="flex items-start gap-2 rounded-lg border border-amber-200/60 bg-amber-50/40 px-3 py-2 text-sm dark:border-amber-900/35 dark:bg-amber-950/20"
          >
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-700 dark:text-amber-400" aria-hidden />
            <div className="min-w-0 flex-1">
              <Link
                href={`/productos/${r.id}`}
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                {r.name}
              </Link>
              <p className="text-xs text-muted-foreground">
                Stock {formatQuantity(r.current_stock)} / mín. {formatQuantity(r.min_stock)} {r.unit_type}
              </p>
            </div>
          </li>
        ))}
      </ul>
      <div className="pt-1">
        <Link href="/inventario" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
          Ver inventario completo
        </Link>
      </div>
    </div>
  );
}
