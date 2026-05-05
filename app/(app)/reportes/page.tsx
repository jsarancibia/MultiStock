import { UpgradeRequired } from "@/components/billing/upgrade-required";
import { getPlanModuleAccess } from "@/lib/billing/require-plan-module";
import { formatCurrency, formatQuantity } from "@/lib/utils";
import { getSimpleReports } from "@/modules/core/reports/actions";

export default async function ReportesPage() {
  const access = await getPlanModuleAccess("reports");
  if (!access.allowed) {
    return (
      <UpgradeRequired
        title="Reportes disponibles desde Pro"
        description="El plan Gratis incluye dashboard básico. Actualiza a Pro para ver reportes de ventas, productos más vendidos, stock bajo y movimientos."
      />
    );
  }

  const reports = await getSimpleReports();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Reportes simples</h1>
        <p className="text-sm text-muted-foreground">
          Vista operativa para ventas por día, productos más vendidos, stock bajo y movimientos.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-lg border p-4">
          <h2 className="mb-3 font-medium">Ventas por día</h2>
          <ul className="space-y-2 text-sm">
            {reports.salesByDay.slice(0, 7).map((row) => (
              <li key={row.day} className="flex items-center justify-between">
                <span>{row.day}</span>
                <span>{formatCurrency(row.total)}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-lg border p-4">
          <h2 className="mb-3 font-medium">Productos más vendidos</h2>
          <ul className="space-y-2 text-sm">
            {reports.topProducts.slice(0, 7).map((row) => (
              <li key={row.name} className="flex items-center justify-between gap-4">
                <span className="truncate">{row.name}</span>
                <span>{formatQuantity(row.quantity)} u</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-lg border p-4">
          <h2 className="mb-3 font-medium">Productos bajo stock</h2>
          <ul className="space-y-2 text-sm">
            {reports.lowStock.slice(0, 7).map((row) => (
              <li key={row.id} className="flex items-center justify-between gap-4">
                <span className="truncate">{row.name}</span>
                <span>
                  {formatQuantity(row.currentStock)}/{formatQuantity(row.minStock)} {row.unitType}
                </span>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-lg border p-4">
          <h2 className="mb-3 font-medium">Movimientos y merma</h2>
          <ul className="space-y-2 text-sm">
            {reports.movementsByDay.slice(0, 7).map((row) => {
              const waste = reports.wasteByDay.find((w) => w.day === row.day)?.quantity ?? 0;
              return (
                <li key={row.day} className="flex items-center justify-between gap-4">
                  <span>{row.day}</span>
                  <span>{row.count} mov · merma {formatQuantity(waste)}</span>
                </li>
              );
            })}
          </ul>
        </article>
      </section>
    </div>
  );
}
