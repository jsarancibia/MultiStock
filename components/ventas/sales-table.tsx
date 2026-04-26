import Link from "next/link";
import { paymentMethodLabels } from "@/lib/validations/sale";

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
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left">
          <tr>
            <th className="px-3 py-2 font-medium">Fecha</th>
            <th className="px-3 py-2 font-medium">Lineas</th>
            <th className="px-3 py-2 font-medium">Metodo</th>
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
                <td className="px-3 py-2">${Number(sale.total).toFixed(2)}</td>
                <td className="px-3 py-2">
                  <Link href={`/ventas/${sale.id}`} className="underline underline-offset-4">
                    Ver
                  </Link>
                </td>
              </tr>
            );
          })}
          {!sales.length ? (
            <tr>
              <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">
                No hay ventas registradas.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
