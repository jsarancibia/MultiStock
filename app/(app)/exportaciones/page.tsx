import { UpgradeRequired } from "@/components/billing/upgrade-required";
import { getPlanModuleAccess } from "@/lib/billing/require-plan-module";
import { getCsvExports } from "@/modules/core/reports/actions";

function toDownloadHref(content: string) {
  return `data:text/csv;charset=utf-8,${encodeURIComponent(content)}`;
}

export default async function ExportacionesPage() {
  const access = await getPlanModuleAccess("exports");
  if (!access.allowed) {
    return (
      <UpgradeRequired
        title="Exportaciones disponibles desde Pro"
        description="El plan Gratis no incluye descargas CSV. Actualiza a Pro para exportar productos, inventario, movimientos, ventas y alertas."
      />
    );
  }

  const csv = await getCsvExports();

  const files = [
    { key: "productos", label: "Productos", content: csv.productos },
    { key: "inventario", label: "Inventario", content: csv.inventario },
    { key: "movimientos", label: "Movimientos", content: csv.movimientos },
    { key: "ventas", label: "Ventas", content: csv.ventas },
    { key: "alertas", label: "Alertas", content: csv.alertas },
  ] as const;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Exportaciones CSV</h1>
        <p className="text-sm text-muted-foreground">
          Descarga información operativa del negocio activo en formato CSV.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {files.map((file) => (
          <a
            key={file.key}
            href={toDownloadHref(file.content)}
            download={`${file.key}.csv`}
            className="rounded-lg border p-4 text-sm transition hover:bg-muted"
          >
            <p className="font-medium">{file.label}</p>
            <p className="mt-1 text-xs text-muted-foreground">Descargar {file.key}.csv</p>
          </a>
        ))}
      </div>
    </div>
  );
}
