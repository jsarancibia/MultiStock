import type { AppModule } from "@/config/navigation";
import { canUseModule, getPlanLimits, isTopTier, type SubscriptionPlan } from "@/config/plans";
import type { ActiveBusiness } from "@/lib/business/get-active-business";
import type { createClient } from "@/lib/supabase/server";
import { getUpgradePath } from "@/lib/billing/plan-banner-config";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export function canBusinessUseModule(business: ActiveBusiness, module: AppModule) {
  return canUseModule(business.subscription_plan, module);
}

const PLAN_NAMES: Record<string, string> = {
  free: "Gratis",
  pro: "Pro",
  super: "Super",
  enterprise: "Enterprise",
};

function getNextPlanName(plan: string): string {
  if (isTopTier(plan as SubscriptionPlan)) return "";
  const path = getUpgradePath(plan as SubscriptionPlan);
  if (path) return path.nextPlanName;
  return "";
}

async function assertCountLimit(
  supabase: SupabaseServerClient,
  business: ActiveBusiness,
  table: string,
  limitField: "products" | "monthlySales" | "monthlyStockMovements",
  filters: Record<string, unknown>,
  label: string,
  prefix: string
): Promise<string | null> {
  const limit = getPlanLimits(business.subscription_plan)[limitField];
  if (limit === null) return null;

  let query = supabase
    .from(table)
    .select("id", { count: "exact", head: true });

  for (const [key, value] of Object.entries(filters)) {
    query = (query as any)[key](value);
  }

  const { count, error } = await query as any;

  if (error) return `No se pudo validar el límite de ${label} del plan.`;
  if ((count ?? 0) >= limit) {
    // Enterprise: mensaje elegante sin revelar números
    if (isTopTier(business.subscription_plan)) {
      return `Tu negocio alcanzó un volumen muy alto de ${label}. Contacta soporte para ampliar capacidad.`;
    }
    const nextPlan = getNextPlanName(business.subscription_plan);
    return `${prefix} permite hasta ${limit} ${label}. Actualiza a ${nextPlan} para seguir.`;
  }

  return null;
}

export function getModuleUpgradeMessage(moduleLabel: string) {
  return `${moduleLabel} está disponible desde el plan Pro.`;
}

export async function assertProductLimit(
  supabase: SupabaseServerClient,
  business: ActiveBusiness
): Promise<string | null> {
  const limit = getPlanLimits(business.subscription_plan).products;
  if (limit === null) return null;

  const { count, error } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("business_id", business.id)
    .eq("active", true);

  if (error) return "No se pudo validar el límite de productos del plan.";
  if ((count ?? 0) >= limit) {
    // Enterprise: mensaje elegante sin revelar el tope técnico
    if (isTopTier(business.subscription_plan)) {
      return "Tu negocio alcanzó un volumen muy alto de productos. Contacta soporte para ampliar capacidad.";
    }
    const planName = PLAN_NAMES[business.subscription_plan] ?? "Gratis";
    const nextPlan = getNextPlanName(business.subscription_plan);
    return `Tu plan ${planName} permite hasta ${limit} productos activos. Actualiza a ${nextPlan} para seguir cargando productos.`;
  }

  return null;
}

export async function assertMonthlySalesLimit(
  supabase: SupabaseServerClient,
  business: ActiveBusiness
): Promise<string | null> {
  const limit = getPlanLimits(business.subscription_plan).monthlySales;
  if (limit === null) return null;

  const startOfMonth = new Date();
  startOfMonth.setUTCDate(1);
  startOfMonth.setUTCHours(0, 0, 0, 0);

  const { count, error } = await supabase
    .from("sales")
    .select("id", { count: "exact", head: true })
    .eq("business_id", business.id)
    .gte("created_at", startOfMonth.toISOString());

  if (error) return "No se pudo validar el límite mensual de ventas del plan.";
  if ((count ?? 0) >= limit) {
    if (isTopTier(business.subscription_plan)) {
      return "Tu negocio alcanzó un volumen muy alto de ventas este mes. Contacta soporte para ampliar capacidad.";
    }
    const planName = PLAN_NAMES[business.subscription_plan] ?? "Gratis";
    const nextPlan = getNextPlanName(business.subscription_plan);
    return `Tu plan ${planName} permite hasta ${limit} ventas mensuales. Actualiza a ${nextPlan} para seguir registrando ventas este mes.`;
  }

  return null;
}

export async function assertMonthlyStockMovementLimit(
  supabase: SupabaseServerClient,
  business: ActiveBusiness
): Promise<string | null> {
  const limit = getPlanLimits(business.subscription_plan).monthlyStockMovements;
  if (limit === null) return null;

  const startOfMonth = new Date();
  startOfMonth.setUTCDate(1);
  startOfMonth.setUTCHours(0, 0, 0, 0);

  const { count, error } = await supabase
    .from("stock_movements")
    .select("id", { count: "exact", head: true })
    .eq("business_id", business.id)
    .gte("created_at", startOfMonth.toISOString());

  if (error) return "No se pudo validar el límite mensual de movimientos del plan.";
  if ((count ?? 0) >= limit) {
    if (isTopTier(business.subscription_plan)) {
      return "Tu negocio alcanzó un volumen muy alto de movimientos este mes. Contacta soporte para ampliar capacidad.";
    }
    const planName = PLAN_NAMES[business.subscription_plan] ?? "Gratis";
    const nextPlan = getNextPlanName(business.subscription_plan);
    return `Tu plan ${planName} permite hasta ${limit} movimientos de inventario mensuales. Actualiza a ${nextPlan} para seguir registrando movimientos este mes.`;
  }

  return null;
}

export async function assertMemberLimit(
  supabase: SupabaseServerClient,
  business: ActiveBusiness
): Promise<string | null> {
  const limit = getPlanLimits(business.subscription_plan).members;
  if (limit === null) return null;

  // business_users incluye al owner + employees, así que el count es el total de miembros
  const { count, error } = await supabase
    .from("business_users")
    .select("id", { count: "exact", head: true })
    .eq("business_id", business.id);

  if (error) return "No se pudo validar el límite de miembros del plan.";

  if ((count ?? 0) >= limit) {
    if (isTopTier(business.subscription_plan)) {
      return "Tu negocio alcanzó un volumen muy alto de usuarios. Contacta soporte para ampliar capacidad.";
    }
    const planName = PLAN_NAMES[business.subscription_plan] ?? "Gratis";
    const nextPlan = getNextPlanName(business.subscription_plan);
    return `Tu plan ${planName} permite hasta ${limit} miembros. Actualiza a ${nextPlan} para agregar más usuarios.`;
  }

  return null;
}
