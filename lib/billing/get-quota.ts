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

/**
 * Obtiene el conteo actual de productos activos y lo compara
 * con el límite del plan.
 *
 * Para planes "comercialmente ilimitados" (enterprise) retorna
 * limit: null, evitando banners de upgrade.
 */
export async function getProductQuota(business: ActiveBusiness): Promise<QuotaInfo> {
  const supabase = await createClient();
  const planLimit = getPlanLimits(business.subscription_plan).products;
  const effectivelyUnlimited = isEffectivelyUnlimited(business.subscription_plan, "products");

  // Si es comercialmente ilimitado, no mostrar medidores
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
}

/**
 * Obtiene el conteo actual de miembros (owner + employees) y lo compara
 * con el límite del plan.
 *
 * Para planes "comercialmente ilimitados" (enterprise) retorna
 * limit: null, evitando banners de upgrade.
 */
export async function getMemberQuota(business: ActiveBusiness): Promise<QuotaInfo> {
  const supabase = await createClient();
  const planLimit = getPlanLimits(business.subscription_plan).members;
  const effectivelyUnlimited = isEffectivelyUnlimited(business.subscription_plan, "members");

  // Si es comercialmente ilimitado, no mostrar medidores
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

  // business_users incluye al owner + employees, el count es el total de miembros
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
}
