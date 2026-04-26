import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { SalesTable } from "@/components/ventas/sales-table";
import { listSales } from "@/modules/core/sales/actions";

export default async function VentasPage() {
  const sales = await listSales();

  return (
    <section className="space-y-6">
      <PageHeader title="Ventas" description="Historial de ventas del negocio activo." />
      <Link href="/ventas/nueva">
        <Button>Nueva venta</Button>
      </Link>
      <SalesTable sales={sales} />
    </section>
  );
}
