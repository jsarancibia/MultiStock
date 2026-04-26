import { PageHeader } from "@/components/layout/page-header";
import { StockMovementForm } from "@/components/inventario/stock-movement-form";
import { createStockMovementAction, getMovementFormData } from "@/modules/core/stock-movements/actions";

export default async function NuevoMovimientoPage() {
  const { products } = await getMovementFormData();

  return (
    <section className="space-y-6">
      <PageHeader title="Registrar movimiento" description="Actualiza stock y guarda el historial del cambio." />
      <StockMovementForm products={products} action={createStockMovementAction} />
    </section>
  );
}
