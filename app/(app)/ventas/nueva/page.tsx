import { PageHeader } from "@/components/layout/page-header";
import { SaleForm } from "@/components/ventas/sale-form";
import { createSaleAction, getSaleFormData } from "@/modules/core/sales/actions";

export default async function NuevaVentaPage() {
  const { business, products } = await getSaleFormData();

  return (
    <section className="space-y-6">
      <PageHeader
        title="Nueva venta"
        description="Agrega productos, valida stock y confirma la venta."
      />
      <SaleForm businessType={business.business_type} products={products} action={createSaleAction} />
    </section>
  );
}
