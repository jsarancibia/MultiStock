import Link from "next/link";
import { AlertTriangle, Info, ShieldAlert } from "lucide-react";
import type { AlertPreviewRow } from "@/lib/business/dashboard-metrics";
import { formatSystemDateTime } from "@/lib/utils";

type AlertPanelProps = {
  rows: AlertPreviewRow[];
  totalPending: number;
};

function SeverityIcon({ severity }: { severity: string }) {
  switch (severity) {
    case "critical":
      return <ShieldAlert className="size-4 shrink-0 text-red-600 dark:text-red-400" aria-hidden />;
    case "warning":
      return <AlertTriangle className="size-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />;
    default:
      return <Info className="size-4 shrink-0 text-blue-600 dark:text-blue-400" aria-hidden />;
  }
}

function severityBorder(severity: string): string {
  switch (severity) {
    case "critical":
      return "border-red-200/60 bg-red-50/40 dark:border-red-900/35 dark:bg-red-950/20";
    case "warning":
      return "border-amber-200/60 bg-amber-50/40 dark:border-amber-900/35 dark:bg-amber-950/20";
    default:
      return "border-blue-200/60 bg-blue-50/40 dark:border-blue-900/35 dark:bg-blue-950/20";
  }
}

export function AlertPanel({ rows, totalPending }: AlertPanelProps) {
  if (!totalPending) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        No hay alertas de stock pendientes.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        {totalPending} alerta(s) sin resolver. Mostrando las {rows.length} más recientes.
      </p>
      <ul className="space-y-2">
        {rows.map((r) => (
          <li
            key={r.id}
            className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${severityBorder(r.severity)}`}
          >
            <SeverityIcon severity={r.severity} />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-foreground">{r.productName}</p>
              <p className="text-xs text-muted-foreground">{r.message}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {formatSystemDateTime(r.createdAt)}
              </p>
            </div>
          </li>
        ))}
      </ul>
      <div className="pt-1">
        <Link
          href="/alertas"
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Ver todas las alertas
        </Link>
      </div>
    </div>
  );
}
