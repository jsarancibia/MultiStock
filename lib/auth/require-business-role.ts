"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";
import { requireActiveBusiness } from "@/lib/business/get-active-business";

export type BusinessRole = "owner" | "admin" | "employee";

export async function getBusinessRole(
  userId: string,
  businessId: string
): Promise<BusinessRole | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_business_role", {
    p_business_id: businessId,
  });

  if (error || !data) return null;
  return data as BusinessRole;
}

export async function requireBusinessRole(allowedRoles: BusinessRole[]) {
  const user = await requireUser();
  const business = await requireActiveBusiness(user.id);

  const role = await getBusinessRole(user.id, business.id);

  if (!role || !allowedRoles.includes(role)) {
    throw new Error("No autorizado");
  }

  return { user, business, role };
}
