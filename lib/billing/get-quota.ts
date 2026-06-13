import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { ActiveBusiness } from "@/lib/business/get-active-business";
import { getPlanLimits, isEffectivelyUnlimited } from "@/config/plans";

export type QuotaInfo = {
  current: number;
  limit: number | null;
  percentage: number;
  isNearLimit: boolean;
  isAtLimit: boolean;
  /** true si el plan se muestra como "ilimitado" comercialmente */
  effectivelyUnlimited: boolean;
};

export const getProductQuota = cache(async (business: ActiveBusiness): Promise<QuotaInfo> => {
  const supabase = await createClient();
  const planLimit = getPlanLimits(business.subscription_plan).products;
  const effectivelyUnlimited = isEffectivelyUnlimited(business.subscription_plan, "products");

  if (effectivelyUnlimited) {
    return {
      current: 0,
      limit: null,
      percentage: 0,
      isNearLimit: false,
      isAtLimit: false,
      effectivelyUnlimited: true,
    };
  }

  const { count } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("business_id", business.id)
    .eq("active", true);

  const current = count ?? 0;

  if (planLimit === null) {
    return { current, limit: null, percentage: 0, isNearLimit: false, isAtLimit: false, effectivelyUnlimited: false };
  }

  const percentage = Math.round((current / planLimit) * 100);

  return {
    current,
    limit: planLimit,
    percentage,
    isNearLimit: percentage >= 80 && percentage < 100,
    isAtLimit: percentage >= 100,
    effectivelyUnlimited: false,
  };
});

export const getMemberQuota = cache(async (business: ActiveBusiness): Promise<QuotaInfo> => {
  const supabase = await createClient();
  const planLimit = getPlanLimits(business.subscription_plan).members;
  const effectivelyUnlimited = isEffectivelyUnlimited(business.subscription_plan, "members");

  if (effectivelyUnlimited) {
    return {
      current: 0,
      limit: null,
      percentage: 0,
      isNearLimit: false,
      isAtLimit: false,
      effectivelyUnlimited: true,
    };
  }

  if (planLimit === null) {
    return { current: 0, limit: null, percentage: 0, isNearLimit: false, isAtLimit: false, effectivelyUnlimited: false };
  }

  const { count } = await supabase
    .from("business_users")
    .select("id", { count: "exact", head: true })
    .eq("business_id", business.id);

  const current = count ?? 0;
  const percentage = Math.round((current / planLimit) * 100);

  return {
    current,
    limit: planLimit,
    percentage,
    isNearLimit: percentage >= 80 && percentage < 100,
    isAtLimit: percentage >= 100,
    effectivelyUnlimited: false,
  };
});
