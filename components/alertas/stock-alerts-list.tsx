"use client";

import { useState, useCallback } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { formatQuantity, formatSystemDateTime } from "@/lib/utils";
import { resolveStockAlertAction } from "@/modules/core/alerts/actions";

export type AlertRow = {
  id: string;
  type: string;
  message: string;
  resolved: boolean;
  created_at: string;
  products: { name: string; current_stock: string; min_stock: string } | null;
};

type StockAlertsListProps = {
  alerts: AlertRow[];
  filterResolved: boolean;
  bulkResolveAction: (alertIds: string[]) => Promise<void>;
};

const alertTypeLabels: Record<string, string> = {
  low_stock: "Stock bajo",
  out_of_stock: "Sin stock",
  perishable_warning: "Perecible",
  waste_warning: "Merma",
};

export function StockAlertsList({
  alerts,
  filterResolved,
  bulkResolveAction,
}: StockAlertsListProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filtered = alerts.filter((a) => a.resolved === filterResolved);
  const unresolvedInView = filtered.filter((a) => !a.resolved);
  const allSelected =
    unresolvedInView.length > 0 &&
    unresolvedInView.every((a) => selectedIds.has(a.id));

  const toggleAll = useCallback(() => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(unresolvedInView.map((a) => a.id)));
    }
  }, [allSelected, unresolvedInView]);

  const toggleOne = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleBulkResolve = async () => {
    if (selectedIds.size === 0) return;
    await bulkResolveAction(Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  if (!filtered.length) {
    return (
      <EmptyState
        icon={<Bell aria-hidden />}
        title="No hay alertas"
        description={
          filterResolved
            ? "No hay alertas resueltas por ahora."
            : "Cuando haya stock bajo, faltante u otros avisos configurados, aparecerán en esta lista."
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      {selectedIds.size > 0 && (
        <Button variant="outline" size="sm" onClick={handleBulkResolve}>
          Marcar seleccionadas como resueltas ({selectedIds.size})
        </Button>
      )}

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              {!filterResolved && (
                <th className="px-3 py-2 w-10">
                  <input
                    type="checkbox"
                    className="size-4 rounded border-border accent-primary cursor-pointer"
                    checked={allSelected}
                    onChange={toggleAll}
                    aria-label="Seleccionar todas"
                  />
                </th>
              )}
              <th className="px-3 py-2 font-medium">Fecha</th>
              <th className="px-3 py-2 font-medium">Producto</th>
              <th className="px-3 py-2 font-medium">Tipo</th>
              <th className="px-3 py-2 font-medium">Mensaje</th>
              <th className="px-3 py-2 font-medium">Estado</th>
              <th className="px-3 py-2 font-medium">Acción</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((alert) => (
              <tr key={alert.id} className="border-t">
                {!filterResolved && (
                  <td className="px-3 py-2">
                    {!alert.resolved ? (
                      <input
                        type="checkbox"
                        className="size-4 rounded border-border accent-primary cursor-pointer"
                        checked={selectedIds.has(alert.id)}
                        onChange={() => toggleOne(alert.id)}
                        aria-label={`Seleccionar alerta ${alert.id}`}
                      />
                    ) : (
                      <span className="block w-4" />
                    )}
                  </td>
                )}
                <td className="px-3 py-2 whitespace-nowrap">
                  {formatSystemDateTime(alert.created_at)}
                </td>
                <td className="px-3 py-2">
                  {alert.products?.name ?? "-"}
                  <p className="text-xs text-muted-foreground">
                    Stock:{" "}
                    {alert.products
                      ? `${formatQuantity(alert.products.current_stock)} / min ${formatQuantity(alert.products.min_stock)}`
                      : "—"}
                  </p>
                </td>
                <td className="px-3 py-2">
                  {alertTypeLabels[alert.type] ?? alert.type}
                </td>
                <td className="px-3 py-2">{alert.message}</td>
                <td className="px-3 py-2">
                  {alert.resolved ? "Resuelta" : "Pendiente"}
                </td>
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

      {selectedIds.size > 0 && (
        <Button variant="outline" size="sm" onClick={handleBulkResolve}>
          Marcar seleccionadas como resueltas ({selectedIds.size})
        </Button>
      )}
    </div>
  );
}
