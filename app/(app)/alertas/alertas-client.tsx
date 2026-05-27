"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { StockAlertsList } from "@/components/alertas/stock-alerts-list";

import type { AlertRow } from "@/components/alertas/stock-alerts-list";

type AlertasClientProps = {
  alerts: AlertRow[];
  bulkResolveAction: (alertIds: string[]) => Promise<void>;
};

export function AlertasClient({ alerts, bulkResolveAction }: AlertasClientProps) {
  const [tab, setTab] = useState<"pending" | "resolved">("pending");

  const filterResolved = tab === "resolved";

  return (
    <section className="space-y-6">
      <PageHeader
        title="Alertas"
        description="Seguimiento de eventos importantes del inventario."
      />

      <div className="flex gap-1 rounded-lg bg-muted p-1 w-fit">
        <button
          className={cn(
            "rounded-md px-3 py-1 text-sm font-medium transition-all",
            tab === "pending"
              ? "bg-background shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => setTab("pending")}
        >
          Pendientes
        </button>
        <button
          className={cn(
            "rounded-md px-3 py-1 text-sm font-medium transition-all",
            tab === "resolved"
              ? "bg-background shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => setTab("resolved")}
        >
          Resueltas
        </button>
      </div>

      <StockAlertsList
        alerts={alerts}
        filterResolved={filterResolved}
        bulkResolveAction={bulkResolveAction}
      />
    </section>
  );
}
