"use server";

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
