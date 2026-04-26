import { StatCard } from "@/components/dashboard/stat-card";
import type { DashboardMetrics } from "@/lib/business/dashboard-metrics";

type Props = {
  metrics: DashboardMetrics;
};

export function VerduleriaDashboardCards({ metrics }: Props) {
  const { verduleria } = metrics;
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <StatCard
        label="Productos perecibles (activos)"
        value={verduleria.perishableCount}
        helperText="Marcados como perecibles en ficha de producto."
      />
      <StatCard
        label="Merma reciente (7 dias)"
        value={verduleria.wasteRecentQty.toFixed(2)}
        helperText="Suma de cantidades en movimientos tipo merma."
      />
    </div>
  );
}
