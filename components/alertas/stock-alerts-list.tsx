import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { APP_LOCALE, formatQuantity } from "@/lib/utils";
import { resolveStockAlertAction } from "@/modules/core/alerts/actions";

type AlertRow = {
  id: string;
  type: string;
  message: string;
  resolved: boolean;
  created_at: string;
  products: { name: string; current_stock: string; min_stock: string } | null;
};

type StockAlertsListProps = {
  alerts: AlertRow[];
};

const alertTypeLabels: Record<string, string> = {
  low_stock: "Stock bajo",
  out_of_stock: "Sin stock",
  perishable_warning: "Perecible",
  waste_warning: "Merma",
};

export function StockAlertsList({ alerts }: StockAlertsListProps) {
  if (!alerts.length) {
    return (
      <EmptyState
        icon={<Bell aria-hidden />}
        title="No hay alertas"
        description="Cuando haya stock bajo, faltante u otros avisos configurados, aparecerán en esta lista."
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[560px] text-sm">
        <thead className="bg-muted/50 text-left">
          <tr>
            <th className="px-3 py-2 font-medium">Fecha</th>
            <th className="px-3 py-2 font-medium">Producto</th>
            <th className="px-3 py-2 font-medium">Tipo</th>
            <th className="px-3 py-2 font-medium">Mensaje</th>
            <th className="px-3 py-2 font-medium">Estado</th>
            <th className="px-3 py-2 font-medium">Acción</th>
          </tr>
        </thead>
        <tbody>
          {alerts.map((alert) => (
            <tr key={alert.id} className="border-t">
              <td className="px-3 py-2 whitespace-nowrap">{new Date(alert.created_at).toLocaleString(APP_LOCALE)}</td>
              <td className="px-3 py-2">
                {alert.products?.name ?? "-"}
                <p className="text-xs text-muted-foreground">
                  Stock:{" "}
                  {alert.products
                    ? `${formatQuantity(alert.products.current_stock)} / min ${formatQuantity(alert.products.min_stock)}`
                    : "—"}
                </p>
              </td>
              <td className="px-3 py-2">{alertTypeLabels[alert.type] ?? alert.type}</td>
              <td className="px-3 py-2">{alert.message}</td>
              <td className="px-3 py-2">{alert.resolved ? "Resuelta" : "Pendiente"}</td>
              <td className="px-3 py-2">
                {!alert.resolved ? (
                  <form action={resolveStockAlertAction}>
                    <input type="hidden" name="alertId" value={alert.id} />
                    <Button type="submit" variant="outline" size="xs">
                      Marcar resuelta
                    </Button>
                  </form>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
