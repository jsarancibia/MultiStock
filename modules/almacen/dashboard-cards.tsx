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
        label="Alta rotación (activos)"
        value={almacen.fastRotationCount}
        helperText="Productos marcados como rotación rápida."
      />
      <StatCard
        label="Margen promedio (sobre costo)"
        value={almacen.avgMarginPercent === null ? "N/D" : `${almacen.avgMarginPercent.toFixed(1)}%`}
        helperText="Promedio sobre productos con costo > 0. El ranking de ventas está arriba."
      />
    </div>
  );
}
