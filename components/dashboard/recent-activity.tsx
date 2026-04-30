import Link from "next/link";

import { movementTypeLabel } from "@/lib/business/movement-type-labels";
import type { DashboardActivityItem } from "@/lib/business/dashboard-metrics";
import { APP_LOCALE, formatCurrency, formatQuantity } from "@/lib/utils";

type RecentActivityProps = {
  items: DashboardActivityItem[];
};

export function RecentActivity({ items }: RecentActivityProps) {
  if (!items.length) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        Aún no hay ventas ni movimientos recientes.
      </p>
    );
  }

  return (
    <ul className="space-y-0 divide-y divide-border/60">
      {items.map((item) => (
        <li key={`${item.kind}-${item.id}`} className="flex flex-wrap items-baseline justify-between gap-2 py-3 first:pt-0">
          {item.kind === "sale" ? (
            <>
              <div className="min-w-0">
                <p className="font-medium">Venta</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(item.at).toLocaleString(APP_LOCALE, {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold tabular-nums">{formatCurrency(item.total)}</span>
                <Link
                  href={`/ventas/${item.id}`}
                  className="text-xs font-medium text-primary underline-offset-4 hover:underline"
                >
                  Ver
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="min-w-0">
                <p className="font-medium">
                  {movementTypeLabel(item.type)}
                  {item.productName ? (
                    <span className="font-normal text-muted-foreground"> — {item.productName}</span>
                  ) : null}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(item.at).toLocaleString(APP_LOCALE, {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <span className="tabular-nums text-sm text-muted-foreground">
                {formatQuantity(item.quantity)}
              </span>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}
