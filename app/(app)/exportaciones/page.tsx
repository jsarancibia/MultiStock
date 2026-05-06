import { UpgradeRequired } from "@/components/billing/upgrade-required";
import { buttonVariants } from "@/components/ui/button";
import { getPlanModuleAccess } from "@/lib/billing/require-plan-module";
import { cn } from "@/lib/utils";
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
        description="El plan Gratis no incluye descargas. Actualiza a Pro para obtener el libro Excel estructurado y archivos CSV con columnas mejoradas."
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
      <header className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold">Exportaciones</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Libro Excel con portada (logo, negocio, ID), misma plantilla para todos los rubros, y datos del negocio activo en cada pestaña (encabezado + totales).
            También podés usar CSV mejorado por apartado para integraciones rápidas.
          </p>
        </div>
        <a
          href="/api/exportaciones/excel"
          className={cn(buttonVariants({ variant: "default", size: "lg" }), "w-full sm:w-auto text-center")}
        >
          Descargar libro Excel completo (.xlsx)
        </a>
      </header>

      <div>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">CSV por categoría</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {files.map((file) => (
            <a
              key={file.key}
              href={toDownloadHref(file.content)}
              download={`${file.key}.csv`}
              className="rounded-lg border border-border bg-card p-4 text-card-foreground text-sm shadow-sm transition hover:bg-muted"
            >
              <p className="font-medium">{file.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">Descargar {file.key}.csv</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
