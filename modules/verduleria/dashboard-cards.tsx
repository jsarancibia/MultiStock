import { StatCard } from "@/components/dashboard/stat-card";
import type { DashboardMetrics } from "@/lib/business/dashboard-metrics";
import { Weight } from "lucide-react";

type Props = {
  metrics: DashboardMetrics;
};

export function VerduleriaDashboardCards({ metrics }: Props) {
  const { verduleria } = metrics;
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <StatCard
        label="Productos perecibles (activos)"
        value={verduleria.perishableCount}
        helperText="Marcados como perecibles en la ficha."
      />
      <StatCard
        label="Merma reciente (7 días)"
        value={verduleria.wasteRecentQty.toFixed(2)}
        helperText="Suma de cantidades en movimientos tipo merma."
      />
      <StatCard
        label="Líneas vendidas por peso (30 días)"
        value={verduleria.weightSaleLines30d}
        helperText="Ítems de venta de productos con venta por peso activada."
        icon={<Weight className="size-4" aria-hidden />}
      />
    </div>
  );
}
