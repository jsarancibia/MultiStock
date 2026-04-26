import { StatCard } from "@/components/dashboard/stat-card";
import type { DashboardMetrics } from "@/lib/business/dashboard-metrics";

type Props = {
  metrics: DashboardMetrics;
};

export function FerreteriaDashboardCards({ metrics }: Props) {
  const { ferreteria } = metrics;
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <StatCard
        label="Con stock, sin movimiento 30d"
        value={ferreteria.staleCount}
        helperText="Puede indicar freno de giro; revisa rotacion y pedidos."
      />
      <StatCard
        label="Categoria con mas SKU activos"
        value={ferreteria.categoryTop ? ferreteria.categoryTop.name : "—"}
        helperText={ferreteria.categoryTop ? `${ferreteria.categoryTop.count} producto(s)` : ""}
      />
    </div>
  );
}
