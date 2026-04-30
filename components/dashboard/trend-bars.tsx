import type { DailyTrendPoint } from "@/lib/business/dashboard-metrics";
import { formatCurrency } from "@/lib/utils";

type TrendBarsProps = {
  points: DailyTrendPoint[];
};

export function TrendBars({ points }: TrendBarsProps) {
  if (!points.length) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Sin datos de ventas en los últimos días.
      </p>
    );
  }

  const maxSale = Math.max(...points.map((p) => p.salesTotal), 1);
  const maxMov = Math.max(...points.map((p) => p.movementsCount), 1);

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Ventas por día (importe)
        </p>
        <div className="flex h-40 items-end gap-1.5 sm:gap-2">
          {points.map((p) => {
            const h = Math.max(8, (p.salesTotal / maxSale) * 100);
            return (
              <div key={p.dateKey} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full max-w-[52px] rounded-t-md bg-primary/85 dark:bg-primary/70"
                  style={{ height: `${h}%` }}
                  title={`${formatCurrency(p.salesTotal)}`}
                />
                <span className="max-w-full truncate text-center text-[10px] text-muted-foreground sm:text-xs">
                  {p.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <div>
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Movimientos de stock (cantidad de registros)
        </p>
        <div className="flex h-24 items-end gap-1.5 sm:gap-2">
          {points.map((p) => {
            const h = Math.max(6, (p.movementsCount / maxMov) * 100);
            return (
              <div key={`m-${p.dateKey}`} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full max-w-[52px] rounded-t-md bg-muted-foreground/35"
                  style={{ height: `${h}%` }}
                  title={`${p.movementsCount} mov.`}
                />
                <span className="text-center text-[10px] font-medium tabular-nums text-muted-foreground sm:text-xs">
                  {p.movementsCount}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
