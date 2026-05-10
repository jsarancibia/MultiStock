import { requirePageAccess } from "@/lib/auth/require-page-access";
import { UpgradeRequired } from "@/components/billing/upgrade-required";
import { buttonVariants } from "@/components/ui/button";
import { getPlanModuleAccess } from "@/lib/billing/require-plan-module";
import { cn } from "@/lib/utils";
import { getCsvExports } from "@/modules/core/reports/actions";

function toDownloadHref(content: string) {
  return `data:text/csv;charset=utf-8,${encodeURIComponent(content)}`;
}

function toExcelHref(reportKey: string) {
  return `/api/exportaciones/${reportKey}/excel`;
}

export default async function ExportacionesPage() {
  await requirePageAccess(["owner"]);
  const access = await getPlanModuleAccess("exports");
  if (!access.allowed) {
    return (
      <UpgradeRequired
        title="Exportaciones disponibles desde Pro"
        description="El plan Gratis no incluye descargas. Actualiza a Pro para obtener exportaciones CSV con columnas mejoradas."
      />
    );
  }

  const csv = await getCsvExports();

  const files = [
    {
      key: "productos",
      label: "Productos",
      description: "Catálogo con código, unidad, categoría, precio y estado.",
      content: csv.productos,
    },
    {
      key: "inventario",
      label: "Inventario",
      description: "Control de stock con estado calculado y columna solicitar.",
      content: csv.inventario,
    },
    {
      key: "movimientos",
      label: "Movimientos",
      description: "Entradas, salidas y ajustes de stock con motivo.",
      content: csv.movimientos,
    },
    {
      key: "ventas",
      label: "Ventas",
      description: "Ventas registradas con total y método de pago.",
      content: csv.ventas,
    },
    {
      key: "alertas",
      label: "Alertas",
      description: "Alertas operativas con estado pendiente o resuelta.",
      content: csv.alertas,
    },
  ] as const;

  return (
    <div className="space-y-6">
      <header>
        <div>
          <h1 className="text-2xl font-semibold">Exportaciones</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Descarga archivos CSV o Excel por categoria, con estructura tipo ERP y formato ajustado al negocio activo.
          </p>
        </div>
      </header>

      <div>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Reportes por categoría</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {files.map((file) => (
            <article
              key={file.key}
              className="space-y-3 rounded-lg border border-border bg-card p-4 text-card-foreground text-sm shadow-sm"
            >
              <p className="font-medium">{file.label}</p>
              <p className="text-xs text-muted-foreground">{file.description}</p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <a
                  href={toExcelHref(file.key)}
                  className={cn(buttonVariants({ size: "sm" }), "w-full text-center sm:w-auto")}
                >
                  Descargar Excel
                </a>
                <a
                  href={toDownloadHref(file.content)}
                  download={`${file.key}.csv`}
                  className={cn(buttonVariants({ size: "sm", variant: "outline" }), "w-full text-center sm:w-auto")}
                >
                  Descargar CSV
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
