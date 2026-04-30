import Link from "next/link";
import { History } from "lucide-react";
import { movementTypeLabels } from "@/lib/business/movement-type-labels";
import { APP_LOCALE, cn, formatCurrency, formatQuantity } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

type MovementRow = {
  id: string;
  type: string;
  quantity: string;
  reason: string | null;
  unit_cost: string | null;
  created_at: string;
  products: { name: string } | null;
};

type MovementsTableProps = {
  movements: MovementRow[];
};

export function MovementsTable({ movements }: MovementsTableProps) {
  if (!movements.length) {
    return (
      <EmptyState
        icon={<History aria-hidden />}
        title="Sin movimientos aún"
        description="Cada compra, ajuste, merma o stock inicial quedará listado aquí con fecha y detalle."
        action={
          <Link href="/inventario/movimientos/nuevo" className={cn(buttonVariants())}>
            Registrar movimiento
          </Link>
        }
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="bg-muted/50 text-left">
          <tr>
            <th className="px-3 py-2 font-medium">Fecha</th>
            <th className="px-3 py-2 font-medium">Producto</th>
            <th className="px-3 py-2 font-medium">Tipo</th>
            <th className="px-3 py-2 font-medium">Cantidad</th>
            <th className="px-3 py-2 font-medium">Costo unit.</th>
            <th className="px-3 py-2 font-medium">Motivo</th>
          </tr>
        </thead>
        <tbody>
          {movements.map((movement) => (
            <tr key={movement.id} className="border-t">
              <td className="px-3 py-2">{new Date(movement.created_at).toLocaleString(APP_LOCALE)}</td>
              <td className="px-3 py-2">{movement.products?.name ?? "-"}</td>
              <td className="px-3 py-2">{movementTypeLabels[movement.type] ?? movement.type}</td>
              <td className="px-3 py-2 whitespace-nowrap">{formatQuantity(movement.quantity)}</td>
              <td className="px-3 py-2">
                {movement.unit_cost != null && movement.unit_cost !== ""
                  ? formatCurrency(movement.unit_cost)
                  : "—"}
              </td>
              <td className="px-3 py-2">{movement.reason ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
