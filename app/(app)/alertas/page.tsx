import { revalidatePath } from "next/cache";
import { createAuditLog } from "@/lib/audit/create-audit-log";
import { createClient } from "@/lib/supabase/server";
import { requireBusinessRole } from "@/lib/auth/require-business-role";
import { listStockAlerts } from "@/modules/core/alerts/actions";
import { AlertasClient } from "./alertas-client";

export default async function AlertasPage() {
  const alerts = await listStockAlerts();

  return (
    <AlertasClient alerts={alerts} bulkResolveAction={bulkResolveAlerts} />
  );
}

async function bulkResolveAlerts(alertIds: string[]) {
  "use server";

  const { user, business } = await requireBusinessRole(["owner", "employee"]);
  const supabase = await createClient();

  const { error } = await supabase
    .from("stock_alerts")
    .update({ resolved: true })
    .in("id", alertIds)
    .eq("business_id", business.id);

  if (error) {
    console.error("bulkResolveAlerts", error.message);
    return;
  }

  await createAuditLog({
    businessId: business.id,
    userId: user.id,
    entityType: "stock_alert",
    entityId: null,
    action: "alert_bulk_resolved",
    summary: `${alertIds.length} alerta(s) resuelta(s) en lote`,
    afterData: { resolved: true, count: alertIds.length },
  });

  revalidatePath("/alertas");
}
