import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { paymentMethodLabels } from "@/lib/validations/sale";
import { APP_LOCALE, formatCurrency, formatQuantity } from "@/lib/utils";
import { getSaleById } from "@/modules/core/sales/actions";

type VentaDetallePageProps = {
  params: Promise<{ id: string }>;
};

export default async function VentaDetallePage({ params }: VentaDetallePageProps) {
  const { id } = await params;
  const sale = await getSaleById(id);

  if (!sale) {
    notFound();
  }

  const paymentKey = sale.payment_method as keyof typeof paymentMethodLabels | null;
  const paymentLabel =
    paymentKey && paymentKey in paymentMethodLabels
      ? paymentMethodLabels[paymentKey]
      : (sale.payment_method ?? "No especificado");

  return (
    <section className="space-y-6">
      <PageHeader
        title={`Venta ${sale.id.slice(0, 8)}`}
        description={`Registrada el ${new Date(sale.created_at).toLocaleString(APP_LOCALE)}`}
      />

      <div className="rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">Método de pago</p>
        <p className="font-medium">{paymentLabel}</p>
        <p className="mt-2 text-sm text-muted-foreground">Total</p>
        <p className="text-lg font-semibold">{formatCurrency(sale.total)}</p>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[520px] text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="px-3 py-2 font-medium">Producto</th>
              <th className="px-3 py-2 font-medium">Cantidad</th>
              <th className="px-3 py-2 font-medium">Precio unitario</th>
              <th className="px-3 py-2 font-medium">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {(sale.sale_items ?? []).map((item) => (
              <tr key={item.id} className="border-t">
                <td className="px-3 py-2">
                  <p className="font-medium">{item.products?.name ?? "Producto eliminado"}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.products?.sku || item.products?.barcode || "-"}
                  </p>
                </td>
                <td className="px-3 py-2">
                  {formatQuantity(item.quantity)} {item.products?.unit_type ?? ""}
                </td>
                <td className="px-3 py-2">{formatCurrency(item.unit_price)}</td>
                <td className="px-3 py-2">{formatCurrency(item.subtotal)}</td>
              </tr>
            ))}
            {!sale.sale_items?.length ? (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-muted-foreground">
                  Esta venta no tiene ítems registrados.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
