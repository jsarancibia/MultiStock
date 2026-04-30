import Link from "next/link";
import { Package } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import { SaleForm } from "@/components/ventas/sale-form";
import { createSaleAction, getSaleFormData } from "@/modules/core/sales/actions";

export default async function NuevaVentaPage() {
  const { business, products } = await getSaleFormData();

  if (!products.length) {
    return (
      <section className="space-y-6">
        <PageHeader
          title="Nueva venta"
          description="Agregá productos, validá stock y confirmá la venta."
        />
        <EmptyState
          icon={<Package aria-hidden />}
          title="No hay productos para vender"
          description="Cargá al menos un producto activo con precio y stock. Luego volvé a registrar la venta."
          action={
            <Link href="/productos/nuevo" className={cn(buttonVariants())}>
              Crear producto
            </Link>
          }
        />
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="Nueva venta"
        description="Agregá productos, validá stock y confirmá la venta."
      />
      <SaleForm businessType={business.business_type} products={products} action={createSaleAction} />
    </section>
  );
}
