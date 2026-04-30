"use server";

import { revalidatePath } from "next/cache";
import { createAuditLog } from "@/lib/audit/create-audit-log";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";
import { requireActiveBusiness } from "@/lib/business/get-active-business";

export async function listStockAlerts() {
  const user = await requireUser();
  const business = await requireActiveBusiness(user.id);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("stock_alerts")
    .select("id,type,message,resolved,created_at,products(name,current_stock,min_stock)")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data ?? [];
}

export async function resolveStockAlertAction(formData: FormData) {
  const user = await requireUser();
  const business = await requireActiveBusiness(user.id);
  const alertId = String(formData.get("alertId") ?? "").trim();
  if (!alertId) return;

  const supabase = await createClient();
  const { data: alert } = await supabase
    .from("stock_alerts")
    .select("id,type,message,products(name)")
    .eq("id", alertId)
    .eq("business_id", business.id)
    .maybeSingle();

  if (!alert) return;

  const { error } = await supabase
    .from("stock_alerts")
    .update({ resolved: true })
    .eq("id", alertId)
    .eq("business_id", business.id);

  if (error) {
    console.error("resolveStockAlertAction", error.message);
    return;
  }

  const pname = alert.products as { name: string } | null;

  await createAuditLog({
    businessId: business.id,
    userId: user.id,
    entityType: "stock_alert",
    entityId: alertId,
    action: "alert_resolved",
    summary: `Alerta ${alert.type} resuelta · ${pname?.name ?? "producto"}`,
    afterData: { resolved: true },
  });

  revalidatePath("/alertas");
}
