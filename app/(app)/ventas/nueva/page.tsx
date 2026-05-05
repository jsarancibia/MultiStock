import Link from "next/link";
import { Package } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageSurface } from "@/components/ui/page-surface";
import { canUseMobileScanner } from "@/config/plans";
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
          description="Agrega productos, valida stock y confirma la venta."
        />
        <EmptyState
          icon={<Package aria-hidden />}
          title="No hay productos para vender"
          description="Carga al menos un producto activo con precio y stock. Luego vuelve a registrar la venta."
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
    <PageSurface>
      <section className="space-y-6">
        <PageHeader
          title="Nueva venta"
          description="Agrega productos, valida stock y confirma la venta."
        />
        <SaleForm
          businessType={business.business_type}
          products={products}
          action={createSaleAction}
          allowMobileBarcodeLink={canUseMobileScanner(business.subscription_plan)}
        />
      </section>
    </PageSurface>
  );
}
