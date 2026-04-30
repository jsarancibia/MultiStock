"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";
import { requireActiveBusiness } from "@/lib/business/get-active-business";

export type AuditLogRow = {
  id: string;
  entity_type: string;
  entity_id: string | null;
  action: string;
  summary: string;
  created_at: string;
  user_id: string | null;
  profiles: { email: string | null } | null;
};

export async function listAuditLogs(limit = 120): Promise<AuditLogRow[]> {
  const user = await requireUser();
  const business = await requireActiveBusiness(user.id);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("audit_logs")
    .select("id, entity_type, entity_id, action, summary, created_at, user_id, profiles(email)")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("listAuditLogs", error.message);
    return [];
  }

  return (data ?? []) as AuditLogRow[];
}
