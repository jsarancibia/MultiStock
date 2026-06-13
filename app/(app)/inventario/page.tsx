import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { StockTable } from "@/components/inventario/stock-table";
import { listInventoryProducts } from "@/modules/core/inventory/actions";
import { getCurrentUser } from "@/lib/auth/session";
import { requireActiveBusiness } from "@/lib/business/get-active-business";
import { getBusinessRole } from "@/lib/auth/require-business-role";

type InventarioPageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function InventarioPage({ searchParams }: InventarioPageProps) {
  const params = await searchParams;
  const user = await getCurrentUser();

  const { products, lowStockCount, totalCount, page, pageSize, totalPages } =
    await listInventoryProducts(params);

  const isEmployee = user
    ? (await getBusinessRole(user.id, (await requireActiveBusiness(user.id)).id)) === "employee"
    : false;

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
        {!isEmployee && (
          <Link href="/inventario/movimientos/nuevo">
            <Button>Registrar movimiento</Button>
          </Link>
        )}
      </div>

      <Link href="/alertas" className="block rounded-lg border p-4 hover:bg-muted/30 transition-colors">
        <h2 className="font-medium">Productos con bajo stock</h2>
        <p className="mt-1 text-sm text-muted-foreground">{lowStockCount} producto(s) en alerta. Ver →</p>
      </Link>

      <StockTable products={products} />
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalCount}
        pageSize={pageSize}
      />
    </section>
  );
}
