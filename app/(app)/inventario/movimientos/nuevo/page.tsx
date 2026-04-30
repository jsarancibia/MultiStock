import Link from "next/link";
import { Package } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import { StockMovementForm } from "@/components/inventario/stock-movement-form";
import { createStockMovementAction, getMovementFormData } from "@/modules/core/stock-movements/actions";

export default async function NuevoMovimientoPage() {
  const { products } = await getMovementFormData();

  if (!products.length) {
    return (
      <section className="space-y-6">
        <PageHeader
          title="Registrar movimiento"
          description="Actualiza el stock y guarda el historial del cambio."
        />
        <EmptyState
          icon={<Package aria-hidden />}
          title="Necesitas al menos un producto"
          description="Carga un producto activo y vuelve a esta pantalla para registrar compras, ajustes o mermas."
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
      <PageHeader title="Registrar movimiento" description="Actualiza el stock y guarda el historial del cambio." />
      <StockMovementForm products={products} action={createStockMovementAction} />
    </section>
  );
}
