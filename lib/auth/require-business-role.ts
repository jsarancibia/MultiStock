"use server";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";
import { requireActiveBusiness } from "@/lib/business/get-active-business";

export type BusinessRole = "owner" | "employee";

export const getBusinessRole = cache(async (
  userId: string,
  businessId: string
): Promise<BusinessRole | null> => {
  const supabase = await createClient();

  const { data: business } = await supabase
    .from("businesses")
    .select("owner_id")
    .eq("id", businessId)
    .single();

  if (business?.owner_id === userId) return "owner";

  const { data } = await supabase
    .from("business_users")
    .select("role")
    .eq("business_id", businessId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!data) return null;
  return data.role as BusinessRole;
});

export async function requireBusinessRole(allowedRoles: BusinessRole[]) {
  const user = await requireUser();
  const business = await requireActiveBusiness(user.id);

  const role = await getBusinessRole(user.id, business.id);

  if (!role || !allowedRoles.includes(role)) {
    throw new Error("No autorizado");
  }

  return { user, business, role };
}
