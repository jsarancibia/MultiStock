import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { businessTypes } from "@/config/business-types";
import { getDashboardMetrics } from "@/lib/business/dashboard-metrics";
import { formatCurrency } from "@/lib/utils";
import { requireUser } from "@/lib/auth/session";
import { requireActiveBusiness } from "@/lib/business/get-active-business";
import { VerduleriaDashboardCards } from "@/modules/verduleria/dashboard-cards";
import { AlmacenDashboardCards } from "@/modules/almacen/dashboard-cards";
import { FerreteriaDashboardCards } from "@/modules/ferreteria/dashboard-cards";

export default async function DashboardPage() {
  const user = await requireUser();
  const business = await requireActiveBusiness(user.id);
  const rubro = businessTypes[business.business_type];
  const { metrics, businessType } = await getDashboardMetrics(business);

  return (
    <section className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={`Bienvenido, ${user.email}. Negocio: ${business.name} · ${rubro.label}.`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Productos activos" value={metrics.activeProducts} />
        <StatCard
          label="Bajo o en stock minimo"
          value={metrics.lowStock}
          helperText="Stock actual en o por debajo del minimo."
        />
        <StatCard
          label="Ventas hoy"
          value={metrics.salesTodayCount}
          helperText={
            metrics.salesTodayCount > 0
              ? `Monto aprox. ${formatCurrency(metrics.salesTodayTotal)}`
              : "Sin ventas registradas hoy"
          }
        />
        <StatCard
          label="Movimientos recientes"
          value={metrics.recentMovementsCount}
          helperText="Ultimos 7 dias."
        />
        <StatCard
          label="Alertas pendientes"
          value={metrics.pendingAlertsCount}
          helperText="Alertas no resueltas."
        />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Indicadores por rubro</h2>
        {businessType === "verduleria" ? <VerduleriaDashboardCards metrics={metrics} /> : null}
        {businessType === "almacen" ? <AlmacenDashboardCards metrics={metrics} /> : null}
        {businessType === "ferreteria" ? <FerreteriaDashboardCards metrics={metrics} /> : null}
      </div>
    </section>
  );
}
