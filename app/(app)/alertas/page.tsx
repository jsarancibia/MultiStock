import { PageHeader } from "@/components/layout/page-header";
import { StockAlertsList } from "@/components/alertas/stock-alerts-list";
import { listStockAlerts } from "@/modules/core/alerts/actions";

export default async function AlertasPage() {
  const alerts = await listStockAlerts();

  return (
    <section className="space-y-6">
      <PageHeader
        title="Alertas"
        description="Seguimiento de eventos importantes del inventario."
      />
      <StockAlertsList alerts={alerts} />
    </section>
  );
}
