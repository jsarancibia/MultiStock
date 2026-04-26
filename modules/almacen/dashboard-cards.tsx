import { StatCard } from "@/components/dashboard/stat-card";
import type { DashboardMetrics } from "@/lib/business/dashboard-metrics";

type Props = {
  metrics: DashboardMetrics;
};

export function AlmacenDashboardCards({ metrics }: Props) {
  const { almacen } = metrics;
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <StatCard
        label="Alta rotacion (activos)"
        value={almacen.fastRotationCount}
        helperText="Productos con marca de rotacion rapida."
      />
      <StatCard
        label="Margen promedio (sobre costo)"
        value={almacen.avgMarginPercent === null ? "N/A" : `${almacen.avgMarginPercent.toFixed(1)}%`}
        helperText="Solo productos con costo mayor a cero."
      />
    </div>
  );
}
