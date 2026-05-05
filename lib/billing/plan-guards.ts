import type { AppModule } from "@/config/navigation";
import { canUseModule, getPlanLimits } from "@/config/plans";
import type { ActiveBusiness } from "@/lib/business/get-active-business";
import type { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export function canBusinessUseModule(business: ActiveBusiness, module: AppModule) {
  return canUseModule(business.subscription_plan, module);
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
    return `Tu plan Gratis permite hasta ${limit} productos activos. Actualiza a Pro para seguir cargando productos.`;
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
    return `Tu plan Gratis permite hasta ${limit} ventas mensuales. Actualiza a Pro para seguir registrando ventas este mes.`;
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
    return `Tu plan Gratis permite hasta ${limit} movimientos de inventario mensuales. Actualiza a Pro para seguir registrando movimientos este mes.`;
  }

  return null;
}
