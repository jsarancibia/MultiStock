import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { paymentMethodLabels } from "@/lib/validations/sale";
import { cn, formatCurrency } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

type SalesRow = {
  id: string;
  total: string;
  payment_method: string | null;
  created_at: string;
  sale_items: Array<{
    quantity: string;
    subtotal: string;
    products: { name: string } | null;
  }> | null;
};

type SalesTableProps = {
  sales: SalesRow[];
};

export function SalesTable({ sales }: SalesTableProps) {
  if (!sales.length) {
    return (
      <EmptyState
        icon={<ShoppingCart aria-hidden />}
        title="Aún no hay ventas"
        description="Registrá la primera venta para ver el historial, totales y método de pago en esta lista."
        action={
          <Link href="/ventas/nueva" className={cn(buttonVariants())}>
            Nueva venta
          </Link>
        }
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left">
          <tr>
            <th className="px-3 py-2 font-medium">Fecha</th>
            <th className="px-3 py-2 font-medium">Líneas</th>
            <th className="px-3 py-2 font-medium">Método</th>
            <th className="px-3 py-2 font-medium">Total</th>
            <th className="px-3 py-2 font-medium">Detalle</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((sale) => {
            const lineCount = sale.sale_items?.length ?? 0;
            const paymentKey = sale.payment_method as keyof typeof paymentMethodLabels | null;
            const methodLabel =
              paymentKey && paymentKey in paymentMethodLabels
                ? paymentMethodLabels[paymentKey]
                : (sale.payment_method ?? "-");
            return (
              <tr key={sale.id} className="border-t">
                <td className="px-3 py-2">{new Date(sale.created_at).toLocaleString("es-AR")}</td>
                <td className="px-3 py-2">{lineCount}</td>
                <td className="px-3 py-2">{methodLabel}</td>
                <td className="px-3 py-2">{formatCurrency(sale.total)}</td>
                <td className="px-3 py-2">
                  <Link href={`/ventas/${sale.id}`} className="underline underline-offset-4">
                    Ver
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
