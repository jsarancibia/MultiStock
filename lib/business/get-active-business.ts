import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { BusinessType } from "@/config/business-types";
import { normalizePlan, type SubscriptionPlan } from "@/config/plans";
import { requireUser } from "@/lib/auth/session";
import {
  getActiveBusinessIdFromCookie,
  setActiveBusinessCookie,
} from "@/lib/business/active-business-cookie";

export type ActiveBusiness = {
  id: string;
  name: string;
  business_type: BusinessType;
  owner_id: string;
  subscription_plan: SubscriptionPlan;
};

function normalizeBusiness(row: ActiveBusiness | null): ActiveBusiness | null {
  if (!row) return null;
  return {
    ...row,
    subscription_plan: normalizePlan(row.subscription_plan),
  };
}

export async function listUserBusinesses(userId: string): Promise<ActiveBusiness[]> {
  const supabase = await createClient();
  const { data: links, error } = await supabase
    .from("business_users")
    .select("business_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  const membershipBusinessIds = [...new Set((links ?? []).map((row) => row.business_id))];
  const { data: memberBusinesses } =
    membershipBusinessIds.length > 0
      ? await supabase
          .from("businesses")
          .select("id,name,business_type,owner_id,subscription_plan")
          .in("id", membershipBusinessIds)
      : { data: [] as ActiveBusiness[] };

  const { data: ownerRows } = await supabase
    .from("businesses")
    .select("id,name,business_type,owner_id,subscription_plan")
    .eq("owner_id", userId)
    .order("created_at", { ascending: true });

  if (error && !ownerRows) return [];
  const merged = [
    ...((memberBusinesses as ActiveBusiness[] | null) ?? []),
    ...((ownerRows as ActiveBusiness[] | null) ?? []),
  ];
  const deduped = new Map<string, ActiveBusiness>();
  for (const business of merged) {
    const normalized = normalizeBusiness(business);
    if (normalized) deduped.set(normalized.id, normalized);
  }
  return [...deduped.values()];
}

export async function getActiveBusiness(userId: string): Promise<ActiveBusiness | null> {
  const userBusinesses = await listUserBusinesses(userId);
  const cookieBusinessId = await getActiveBusinessIdFromCookie();

  if (cookieBusinessId) {
    const businessByCookie = userBusinesses.find((business) => business.id === cookieBusinessId);
    if (businessByCookie) {
      return businessByCookie;
    }
  }

  if (userBusinesses.length > 0) {
    return userBusinesses[0];
  }

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
      .select("id,name,business_type,owner_id,subscription_plan")
      .eq("id", membership.business_id)
      .maybeSingle();

    if (businessByMembership) {
      return normalizeBusiness(businessByMembership as ActiveBusiness);
    }
  }

  const { data: businessByOwner } = await supabase
    .from("businesses")
    .select("id,name,business_type,owner_id,subscription_plan")
    .eq("owner_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return normalizeBusiness((businessByOwner as ActiveBusiness | null) ?? null);
}

export async function requireActiveBusiness(userId: string) {
  const business = await getActiveBusiness(userId);
  if (!business) {
    redirect("/onboarding");
  }
  return business;
}

export async function setActiveBusinessAction(formData: FormData) {
  const value = String(formData.get("businessId") ?? "").trim();
  if (!value) return;
  const user = await requireUser();
  const userBusinesses = await listUserBusinesses(user.id);
  if (!userBusinesses.some((business) => business.id === value)) return;
  await setActiveBusinessCookie(value);
}
