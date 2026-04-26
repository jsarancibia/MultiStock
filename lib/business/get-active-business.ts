import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { BusinessType } from "@/config/business-types";

export type ActiveBusiness = {
  id: string;
  name: string;
  business_type: BusinessType;
  owner_id: string;
};

export async function getActiveBusiness(userId: string): Promise<ActiveBusiness | null> {
  const supabase = await createClient();

  const { data: membership, error: membershipError } = await supabase
    .from("business_users")
    .select("business_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!membershipError && membership?.business_id) {
    const { data: businessByMembership } = await supabase
      .from("businesses")
      .select("id,name,business_type,owner_id")
      .eq("id", membership.business_id)
      .maybeSingle();

    if (businessByMembership) {
      return businessByMembership as ActiveBusiness;
    }
  }

  const { data: businessByOwner } = await supabase
    .from("businesses")
    .select("id,name,business_type,owner_id")
    .eq("owner_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return (businessByOwner as ActiveBusiness | null) ?? null;
}

export async function requireActiveBusiness(userId: string) {
  const business = await getActiveBusiness(userId);
  if (!business) {
    redirect("/onboarding");
  }
  return business;
}
