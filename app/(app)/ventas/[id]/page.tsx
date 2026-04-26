import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { paymentMethodLabels } from "@/lib/validations/sale";
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
        description={`Registrada el ${new Date(sale.created_at).toLocaleString("es-AR")}`}
      />

      <div className="rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">Metodo de pago</p>
        <p className="font-medium">{paymentLabel}</p>
        <p className="mt-2 text-sm text-muted-foreground">Total</p>
        <p className="text-lg font-semibold">${Number(sale.total).toFixed(2)}</p>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
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
                  {item.quantity} {item.products?.unit_type ?? ""}
                </td>
                <td className="px-3 py-2">${Number(item.unit_price).toFixed(2)}</td>
                <td className="px-3 py-2">${Number(item.subtotal).toFixed(2)}</td>
              </tr>
            ))}
            {!sale.sale_items?.length ? (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-muted-foreground">
                  Esta venta no tiene items registrados.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
