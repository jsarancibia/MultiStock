import type { AuditLogRow } from "@/modules/core/audit/actions";
import { APP_LOCALE } from "@/lib/utils";

const entityLabels: Record<string, string> = {
  product: "Producto",
  stock_movement: "Movimiento",
  sale: "Venta",
  supplier: "Proveedor",
  category: "Categoría",
  stock_alert: "Alerta",
  business: "Negocio",
};

const actionLabels: Record<string, string> = {
  created: "Alta",
  updated: "Edición",
  deleted: "Baja",
  deactivated: "Desactivación",
  stock_changed: "Stock",
  price_changed: "Precio",
  sale_confirmed: "Venta",
  alert_resolved: "Alerta resuelta",
};

type AuditTableProps = {
  rows: AuditLogRow[];
};

export function AuditTable({ rows }: AuditTableProps) {
  if (!rows.length) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Aún no hay registros de auditoría para este negocio.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[720px] text-sm">
        <thead className="bg-muted/50 text-left">
          <tr>
            <th className="px-3 py-2 font-medium">Fecha</th>
            <th className="px-3 py-2 font-medium">Usuario</th>
            <th className="px-3 py-2 font-medium">Tipo</th>
            <th className="px-3 py-2 font-medium">Acción</th>
            <th className="px-3 py-2 font-medium">Detalle</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t">
              <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">
                {new Date(row.created_at).toLocaleString(APP_LOCALE)}
              </td>
              <td className="px-3 py-2">
                {row.profiles?.email ?? (row.user_id ? `${row.user_id.slice(0, 8)}…` : "—")}
              </td>
              <td className="px-3 py-2">{entityLabels[row.entity_type] ?? row.entity_type}</td>
              <td className="px-3 py-2">{actionLabels[row.action] ?? row.action}</td>
              <td className="max-w-md px-3 py-2 text-foreground">{row.summary}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
