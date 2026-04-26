import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { MovementsTable } from "@/components/inventario/movements-table";
import { getProductById } from "@/modules/core/products/actions";
import { listStockMovements } from "@/modules/core/stock-movements/actions";

type ProductMovementsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductMovementsPage({ params }: ProductMovementsPageProps) {
  const { id } = await params;
  const [product, movements] = await Promise.all([getProductById(id), listStockMovements(id)]);
  if (!product) notFound();

  return (
    <section className="space-y-6">
      <PageHeader
        title={`Movimientos de ${product.name}`}
        description="Historial de stock del producto seleccionado."
      />
      <MovementsTable movements={movements} />
    </section>
  );
}
