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
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left">
          <tr>
            <th className="px-3 py-2 font-medium">Fecha</th>
            <th className="px-3 py-2 font-medium">Producto</th>
            <th className="px-3 py-2 font-medium">Tipo</th>
            <th className="px-3 py-2 font-medium">Mensaje</th>
            <th className="px-3 py-2 font-medium">Estado</th>
          </tr>
        </thead>
        <tbody>
          {alerts.map((alert) => (
            <tr key={alert.id} className="border-t">
              <td className="px-3 py-2">{new Date(alert.created_at).toLocaleString("es-AR")}</td>
              <td className="px-3 py-2">
                {alert.products?.name ?? "-"}
                <p className="text-xs text-muted-foreground">
                  Stock: {alert.products?.current_stock ?? "-"} / min {alert.products?.min_stock ?? "-"}
                </p>
              </td>
              <td className="px-3 py-2">{alertTypeLabels[alert.type] ?? alert.type}</td>
              <td className="px-3 py-2">{alert.message}</td>
              <td className="px-3 py-2">{alert.resolved ? "Resuelta" : "Pendiente"}</td>
            </tr>
          ))}
          {!alerts.length ? (
            <tr>
              <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">
                No hay alertas registradas.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
