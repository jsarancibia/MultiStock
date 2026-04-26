import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { StockTable } from "@/components/inventario/stock-table";
import { listInventoryProducts, listLowStockProducts } from "@/modules/core/inventory/actions";

export default async function InventarioPage() {
  const [products, lowStockProducts] = await Promise.all([listInventoryProducts(), listLowStockProducts()]);

  return (
    <section className="space-y-6">
      <PageHeader
        title="Inventario"
        description="Control de stock, entradas, salidas y ajustes."
      />

      <div className="flex flex-wrap gap-3">
        <Link href="/inventario/movimientos">
          <Button variant="outline">Ver movimientos</Button>
        </Link>
        <Link href="/inventario/movimientos/nuevo">
          <Button>Registrar movimiento</Button>
        </Link>
      </div>

      <div className="rounded-lg border p-4">
        <h2 className="font-medium">Productos con bajo stock</h2>
        <p className="mt-1 text-sm text-muted-foreground">{lowStockProducts.length} producto(s) en alerta.</p>
      </div>

      <StockTable products={products} />
    </section>
  );
}
