import Link from "next/link";
import type { TopProductRow } from "@/lib/business/dashboard-metrics";
import { formatCurrency, formatQuantity } from "@/lib/utils";

type TopProductsPanelProps = {
  items: TopProductRow[];
};

export function TopProductsPanel({ items }: TopProductsPanelProps) {
  if (!items.length) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        Aún no hay ventas en los últimos 30 días para este resumen.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[320px] text-sm">
        <thead>
          <tr className="border-b border-border/80 text-left text-xs font-medium text-muted-foreground">
            <th className="pb-2 pr-2">Producto</th>
            <th className="pb-2 pr-2 text-right">Cantidad</th>
            <th className="pb-2 text-right">Facturación</th>
          </tr>
        </thead>
        <tbody>
          {items.map((row, i) => (
            <tr key={row.productId} className="border-b border-border/40 last:border-0">
              <td className="py-2.5 pr-2">
                <span className="text-muted-foreground tabular-nums">{i + 1}.</span>{" "}
                <Link
                  href={`/productos/${row.productId}`}
                  className="font-medium text-foreground underline-offset-4 hover:underline"
                >
                  {row.name}
                </Link>
              </td>
              <td className="py-2.5 pr-2 text-right tabular-nums text-muted-foreground">
                {formatQuantity(row.quantity)}
              </td>
              <td className="py-2.5 text-right font-medium tabular-nums">
                {formatCurrency(row.revenue)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
