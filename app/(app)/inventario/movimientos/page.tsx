import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { MovementsTable } from "@/components/inventario/movements-table";
import { listStockMovements } from "@/modules/core/stock-movements/actions";

export default async function InventarioMovimientosPage() {
  const movements = await listStockMovements();

  return (
    <section className="space-y-6">
      <BackButton href="/inventario" />
      <PageHeader title="Movimientos de stock" description="Historial general de entradas, salidas y ajustes." />
      <Link href="/inventario/movimientos/nuevo">
        <Button>Nuevo movimiento</Button>
      </Link>
      <MovementsTable movements={movements} />
    </section>
  );
}
