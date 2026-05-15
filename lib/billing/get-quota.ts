import { createClient } from "@/lib/supabase/server";
import type { ActiveBusiness } from "@/lib/business/get-active-business";
import { getPlanLimits } from "@/config/plans";
import { getBannerLimit } from "@/lib/billing/plan-banner-config";

export type QuotaInfo = {
  current: number;
  limit: number | null;
  percentage: number;
  isNearLimit: boolean;
  isAtLimit: boolean;
};

/**
 * Obtiene el conteo actual de productos activos y lo compara
 * con el límite del plan (null = ilimitado).
 */
export async function getProductQuota(business: ActiveBusiness): Promise<QuotaInfo> {
  const supabase = await createClient();
  const planLimit = getPlanLimits(business.subscription_plan).products;
  const bannerLimit = getBannerLimit(business.subscription_plan, "products");

  // El límite "real" de la lógica de negocio
  const effectiveLimit = planLimit ?? bannerLimit;

  const { count } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("business_id", business.id)
    .eq("active", true);

  const current = count ?? 0;

  if (effectiveLimit === null) {
    return { current, limit: null, percentage: 0, isNearLimit: false, isAtLimit: false };
  }

  const percentage = Math.round((current / effectiveLimit) * 100);

  return {
    current,
    limit: effectiveLimit,
    percentage,
    isNearLimit: percentage >= 80 && percentage < 100,
    isAtLimit: percentage >= 100,
  };
}

/**
 * Obtiene el conteo actual de miembros (owner + employees) y lo compara
 * con el límite del plan.
 */
export async function getMemberQuota(business: ActiveBusiness): Promise<QuotaInfo> {
  const supabase = await createClient();

  // Primero intentar desde plan-limits real (members), luego banner config como fallback
  const planLimit = getPlanLimits(business.subscription_plan).members;
  const bannerLimit = getBannerLimit(business.subscription_plan, "members");
  const effectiveLimit = planLimit ?? bannerLimit;

  if (effectiveLimit === null) {
    return { current: 0, limit: null, percentage: 0, isNearLimit: false, isAtLimit: false };
  }

  // business_users incluye al owner + employees, el count es el total de miembros
  const { count } = await supabase
    .from("business_users")
    .select("id", { count: "exact", head: true })
    .eq("business_id", business.id);

  const current = count ?? 0;
  const percentage = Math.round((current / effectiveLimit) * 100);

  return {
    current,
    limit: effectiveLimit,
    percentage,
    isNearLimit: percentage >= 80 && percentage < 100,
    isAtLimit: percentage >= 100,
  };
}
