import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database";

export type AuditEntityType =
  | "product"
  | "stock_movement"
  | "sale"
  | "supplier"
  | "category"
  | "stock_alert"
  | "business";

export type AuditAction =
  | "created"
  | "updated"
  | "deleted"
  | "deactivated"
  | "stock_changed"
  | "price_changed"
  | "sale_confirmed"
  | "alert_resolved";

type CreateAuditLogInput = {
  businessId: string;
  userId: string | null;
  entityType: AuditEntityType;
  entityId: string | null;
  action: AuditAction;
  summary: string;
  beforeData?: Json | null;
  afterData?: Json | null;
  metadata?: Json | null;
};

/**
 * Registra una entrada de auditoría. No lanza: fallos se registran en consola para no romper el flujo principal.
 */
export async function createAuditLog(input: CreateAuditLogInput): Promise<void> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("audit_logs").insert({
      business_id: input.businessId,
      user_id: input.userId,
      entity_type: input.entityType,
      entity_id: input.entityId,
      action: input.action,
      summary: input.summary,
      before_data: input.beforeData ?? null,
      after_data: input.afterData ?? null,
      metadata: input.metadata ?? null,
    });
    if (error) {
      console.error("[audit_logs]", error.message);
    }
  } catch (e) {
    console.error("[audit_logs]", e);
  }
}
