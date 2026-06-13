import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { SalesTable } from "@/components/ventas/sales-table";
import { NewSaleShortcut } from "@/components/ventas/new-sale-shortcut";
import { cn } from "@/lib/utils";
import { listSales } from "@/modules/core/sales/actions";

type VentasPageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function VentasPage({ searchParams }: VentasPageProps) {
  const params = await searchParams;
  const { sales, totalCount, page, pageSize, totalPages } = await listSales(params);

  return (
    <section className="space-y-6">
      <NewSaleShortcut />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          className="sm:max-w-xl"
          title="Ventas"
          description="Historial de ventas del negocio activo. Cada registro incluye total y método de pago."
        />
        <Link
          href="/ventas/nueva"
          className={cn(buttonVariants(), "shrink-0 self-start sm:self-center")}
          title="Atajo: tecla N"
        >
          Nueva venta (N)
        </Link>
      </div>
      <SalesTable sales={sales} />
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalCount}
        pageSize={pageSize}
      />
    </section>
  );
}
