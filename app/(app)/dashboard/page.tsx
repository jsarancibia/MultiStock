import {
  AlertTriangle,
  Coins,
  PackagePlus,
  Package,
  PlusCircle,
  Receipt,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { DashboardQuickActions } from "@/components/dashboard/dashboard-quick-actions";
import { TrendBars } from "@/components/dashboard/trend-bars";
import { TopProductsPanel } from "@/components/dashboard/top-products-panel";
import { TopCategoriesPanel } from "@/components/dashboard/top-categories-panel";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { LowStockPanel } from "@/components/dashboard/low-stock-panel";
import { buttonVariants } from "@/components/ui/button";
import { MetricCard } from "@/components/ui/metric-card";
import { PageSurface } from "@/components/ui/page-surface";
import { SimpleChartCard } from "@/components/ui/simple-chart-card";
import { StatusRing } from "@/components/ui/status-ring";
import { TaskListCard } from "@/components/dashboard/task-list-card";
import { businessTypes } from "@/config/business-types";
import { getDashboardMetrics } from "@/lib/business/dashboard-metrics";
import { cn, formatCurrency } from "@/lib/utils";
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
  const salesLast7Days = metrics.trend.reduce((acc, point) => acc + point.salesTotal, 0);
  const stockHealthyPercent =
    metrics.activeProducts > 0
      ? ((metrics.activeProducts - metrics.lowStock) / metrics.activeProducts) * 100
      : 100;

  const salesHelper =
    metrics.salesTodayCount > 0
      ? `Monto del día ${formatCurrency(metrics.salesTodayTotal)}`
      : "Sin ventas registradas hoy";

  return (
    <PageSurface>
      <section className="space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <PageHeader
            title="Panel de control"
            description={`${business.name} · ${rubro.label}. Operación rápida: stock, ventas y alertas en un vistazo.`}
          />
          <div className="flex flex-wrap gap-2">
            <Link href="/ventas/nueva" className={cn(buttonVariants(), "bg-emerald-600 hover:bg-emerald-700")}>
              <PlusCircle className="mr-1 size-4" />
              Nueva venta
            </Link>
            <Link href="/productos/nuevo" className={cn(buttonVariants({ variant: "outline" }))}>
              <PackagePlus className="mr-1 size-4" />
              Nuevo producto
            </Link>
          </div>
        </div>

        <DashboardQuickActions />

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Ventas hoy"
            value={metrics.salesTodayCount}
            helperText={salesHelper}
            icon={<Receipt aria-hidden />}
            tone="success"
          />
          <MetricCard
            label="Ventas 7 días"
            value={formatCurrency(salesLast7Days)}
            helperText="Acumulado del período reciente."
            icon={<TrendingUp aria-hidden />}
            tone="info"
          />
          <MetricCard
            label="Productos activos"
            value={metrics.activeProducts}
            helperText="SKU activos en el catálogo."
            icon={<Package aria-hidden />}
            tone="default"
          />
          <MetricCard
            label="Alertas pendientes"
            value={metrics.pendingAlertsCount}
            helperText="Alertas sin marcar como resueltas."
            icon={<AlertTriangle aria-hidden />}
            tone={metrics.pendingAlertsCount > 0 ? "danger" : "default"}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Capital en inventario"
            value={formatCurrency(metrics.estimatedCapital)}
            helperText="Σ stock × costo (referencia, no contabilidad)."
            icon={<Coins aria-hidden />}
            tone="warning"
          />
          <MetricCard
            label="Productos bajo mínimo"
            value={metrics.lowStock}
            helperText="Stock actual ≤ stock mínimo configurado."
            icon={<AlertTriangle aria-hidden />}
            tone={metrics.lowStock > 0 ? "danger" : "default"}
          />
          <MetricCard
            label="Movimientos (7 días)"
            value={metrics.recentMovementsCount}
            helperText="Registros de compra, ajuste, merma, etc."
            icon={<TrendingUp aria-hidden />}
            tone="info"
          />
          <MetricCard
            label="Stock saludable"
            value={`${Math.max(0, Math.round(stockHealthyPercent))}%`}
            helperText="Porcentaje de productos por encima del mínimo."
            tone="success"
            trailing={<StatusRing value={stockHealthyPercent} label="Salud de stock" />}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <div className="space-y-6 lg:col-span-3">
            <SimpleChartCard
              title="Tendencia últimos 7 días"
              description="Importe de ventas y cantidad de movimientos de stock por día."
            >
              <TrendBars points={metrics.trend} />
            </SimpleChartCard>
            <SimpleChartCard
              title="Productos más vendidos (30 días)"
              description="Por facturación (ítems asociados a ventas en el período)."
            >
              <TopProductsPanel items={metrics.topProducts} />
            </SimpleChartCard>
          </div>
          <div className="space-y-6 lg:col-span-2">
            <SimpleChartCard
              title="Categorías con más productos"
              description="Solo productos activos con categoría asignada."
            >
              <TopCategoriesPanel items={metrics.topCategories} />
            </SimpleChartCard>
            <TaskListCard
              title="Tareas sugeridas"
              description="Acciones de mantenimiento diario para mantener la operación estable."
              items={[
                {
                  id: "review-alerts",
                  label: "Revisar alertas de stock",
                  helper: `${metrics.pendingAlertsCount} alerta(s) pendiente(s).`,
                  action: <Link href="/alertas" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>Abrir</Link>,
                },
                {
                  id: "new-product",
                  label: "Cargar producto de reposición",
                  helper: "Mantener catálogo activo para no frenar ventas.",
                  action: <Link href="/productos/nuevo" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>Crear</Link>,
                },
                {
                  id: "new-movement",
                  label: "Registrar ingreso o ajuste",
                  helper: "Actualizar stock real antes de la próxima venta.",
                  action: <Link href="/inventario/movimientos/nuevo" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>Registrar</Link>,
                },
              ]}
            />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <SimpleChartCard
            title="Stock crítico"
            description="Priorizamos los casos más lejos del mínimo."
          >
            <LowStockPanel rows={metrics.lowStockPreview} totalLow={metrics.lowStock} />
          </SimpleChartCard>
          <SimpleChartCard
            title="Actividad reciente"
            description="Últimas ventas y movimientos de stock (combinado)."
          >
            <RecentActivity items={metrics.recentActivity} />
          </SimpleChartCard>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold tracking-tight text-muted-foreground">
            Indicadores por rubro
          </h2>
          {businessType === "verduleria" ? <VerduleriaDashboardCards metrics={metrics} /> : null}
          {businessType === "almacen" ? <AlmacenDashboardCards metrics={metrics} /> : null}
          {businessType === "ferreteria" ? <FerreteriaDashboardCards metrics={metrics} /> : null}
        </div>
      </section>
    </PageSurface>
  );
}
