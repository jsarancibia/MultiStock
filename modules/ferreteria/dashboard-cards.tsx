import { StatCard } from "@/components/dashboard/stat-card";
import type { DashboardMetrics } from "@/lib/business/dashboard-metrics";
import { Wrench } from "lucide-react";

type Props = {
  metrics: DashboardMetrics;
};

export function FerreteriaDashboardCards({ metrics }: Props) {
  const { ferreteria } = metrics;
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <StatCard
        label="Con stock, sin movimiento 30 días"
        value={ferreteria.staleCount}
        helperText="Posible freno de giro; revisar pedidos."
      />
      <StatCard
        label="Categoría con más SKU activos"
        value={ferreteria.categoryTop ? ferreteria.categoryTop.name : "—"}
        helperText={
          ferreteria.categoryTop ? `${ferreteria.categoryTop.count} producto(s)` : "Sin datos"
        }
      />
      <StatCard
        label="Referencias técnicas bajo mínimo"
        value={ferreteria.lowStockTechnicalCount}
        helperText="Productos con marca, modelo o medida y stock bajo."
        icon={<Wrench className="size-4" aria-hidden />}
        emphasize={ferreteria.lowStockTechnicalCount > 0}
      />
    </div>
  );
}
