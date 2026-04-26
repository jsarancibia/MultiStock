import { createClient } from "@/lib/supabase/server";
import { marginPercentOnCost } from "@/lib/business/business-type-config";
import type { ActiveBusiness } from "@/lib/business/get-active-business";
import type { BusinessType } from "@/config/business-types";

function startOfLocalDay(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function daysAgoIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

export type DashboardMetrics = {
  activeProducts: number;
  lowStock: number;
  salesTodayCount: number;
  salesTodayTotal: number;
  recentMovementsCount: number;
  pendingAlertsCount: number;
  verduleria: {
    perishableCount: number;
    wasteRecentQty: number;
  };
  almacen: {
    fastRotationCount: number;
    avgMarginPercent: number | null;
  };
  ferreteria: {
    staleCount: number;
    categoryTop: { name: string; count: number } | null;
  };
};

export async function getDashboardMetrics(
  business: ActiveBusiness
): Promise<{
  businessType: BusinessType;
  metrics: DashboardMetrics;
}> {
  const supabase = await createClient();
  const businessId = business.id;
  const type = business.business_type;

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id,current_stock,min_stock,active,metadata,cost_price,sale_price,categories(name)")
    .eq("business_id", businessId);

  if (productsError) {
    return {
      businessType: type,
      metrics: {
        activeProducts: 0,
        lowStock: 0,
        salesTodayCount: 0,
        salesTodayTotal: 0,
        recentMovementsCount: 0,
        pendingAlertsCount: 0,
        verduleria: { perishableCount: 0, wasteRecentQty: 0 },
        almacen: { fastRotationCount: 0, avgMarginPercent: null },
        ferreteria: { staleCount: 0, categoryTop: null },
      },
    };
  }

  const all = products ?? [];
  const active = all.filter((p) => p.active);
  const activeProducts = active.length;
  const lowStock = active.filter((p) => Number(p.current_stock) <= Number(p.min_stock)).length;

  const { data: salesRaw } = await supabase
    .from("sales")
    .select("id,total,created_at")
    .eq("business_id", businessId)
    .gte("created_at", startOfLocalDay());

  const salesToday = salesRaw ?? [];
  const salesTodayCount = salesToday.length;
  const salesTodayTotal = salesToday.reduce((acc, s) => acc + Number(s.total), 0);

  const [recentMovementsRes, pendingAlertsRes] = await Promise.all([
    supabase
      .from("stock_movements")
      .select("id", { count: "exact", head: true })
      .eq("business_id", businessId)
      .gte("created_at", daysAgoIso(7)),
    supabase
      .from("stock_alerts")
      .select("id", { count: "exact", head: true })
      .eq("business_id", businessId)
      .eq("resolved", false),
  ]);

  const recentMovementsCount = recentMovementsRes.count ?? 0;
  const pendingAlertsCount = pendingAlertsRes.count ?? 0;

  const meta = (m: unknown) => (m && typeof m === "object" ? (m as Record<string, unknown>) : {});

  const perishableCount = active.filter((p) => meta(p.metadata).is_perishable === true).length;

  const { data: wasteRows } = await supabase
    .from("stock_movements")
    .select("quantity")
    .eq("business_id", businessId)
    .eq("type", "waste")
    .gte("created_at", daysAgoIso(7));

  const wasteRecentQty = (wasteRows ?? []).reduce(
    (acc, row) => acc + Math.abs(Number(row.quantity)),
    0
  );

  const fastRotationCount = active.filter((p) => meta(p.metadata).fast_rotation === true).length;

  const margins: number[] = [];
  for (const p of active) {
    const cost = Number(p.cost_price);
    const sale = Number(p.sale_price);
    const m = marginPercentOnCost(cost, sale);
    if (m !== null) margins.push(m);
  }
  const avgMarginPercent =
    margins.length > 0 ? margins.reduce((a, b) => a + b, 0) / margins.length : null;

  const since30 = daysAgoIso(30);
  const { data: recentMoves } = await supabase
    .from("stock_movements")
    .select("product_id")
    .eq("business_id", businessId)
    .gte("created_at", since30);

  const recentlyMoved = new Set((recentMoves ?? []).map((r) => r.product_id));
  const staleCount = active.filter(
    (p) => Number(p.current_stock) > 0 && !recentlyMoved.has(p.id)
  ).length;

  const byCategory = new Map<string, number>();
  for (const p of active) {
    const row = p as { categories?: { name: string } | null };
    const n = row.categories?.name ?? "Sin categoria";
    byCategory.set(n, (byCategory.get(n) ?? 0) + 1);
  }
  let categoryTop: { name: string; count: number } | null = null;
  for (const [name, count] of byCategory) {
    if (!categoryTop || count > categoryTop.count) {
      categoryTop = { name, count };
    }
  }

  return {
    businessType: type,
    metrics: {
      activeProducts,
      lowStock,
      salesTodayCount,
      salesTodayTotal,
      recentMovementsCount,
      pendingAlertsCount,
      verduleria: { perishableCount, wasteRecentQty },
      almacen: { fastRotationCount, avgMarginPercent },
      ferreteria: { staleCount, categoryTop },
    },
  };
}
