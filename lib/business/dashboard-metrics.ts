import { createClient } from "@/lib/supabase/server";
import { marginPercentOnCost } from "@/lib/business/business-type-config";
import type { ActiveBusiness } from "@/lib/business/get-active-business";
import type { BusinessType } from "@/config/business-types";
import { APP_LOCALE } from "@/config/locale";

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

/** Inicio del día local hace `daysBack` días (00:00). */
function localDayStartIso(daysBack: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysBack);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function localDateKeyFromIso(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export type DailyTrendPoint = {
  dateKey: string;
  label: string;
  salesTotal: number;
  movementsCount: number;
};

export type TopProductRow = {
  productId: string;
  name: string;
  revenue: number;
  quantity: number;
};

export type DashboardActivityItem =
  | { kind: "sale"; id: string; at: string; total: number }
  | {
      kind: "movement";
      id: string;
      at: string;
      type: string;
      quantity: string;
      productName: string | null;
    };

export type LowStockPreviewRow = {
  id: string;
  name: string;
  current_stock: string;
  min_stock: string;
  unit_type: string;
};

export type DashboardMetrics = {
  activeProducts: number;
  lowStock: number;
  salesTodayCount: number;
  salesTodayTotal: number;
  recentMovementsCount: number;
  pendingAlertsCount: number;
  estimatedCapital: number;
  trend: DailyTrendPoint[];
  topProducts: TopProductRow[];
  topCategories: { name: string; count: number }[];
  recentActivity: DashboardActivityItem[];
  lowStockPreview: LowStockPreviewRow[];
  verduleria: {
    perishableCount: number;
    wasteRecentQty: number;
    weightSaleLines30d: number;
  };
  almacen: {
    fastRotationCount: number;
    avgMarginPercent: number | null;
  };
  ferreteria: {
    staleCount: number;
    categoryTop: { name: string; count: number } | null;
    lowStockTechnicalCount: number;
  };
};

function emptyMetrics(): DashboardMetrics {
  return {
    activeProducts: 0,
    lowStock: 0,
    salesTodayCount: 0,
    salesTodayTotal: 0,
    recentMovementsCount: 0,
    pendingAlertsCount: 0,
    estimatedCapital: 0,
    trend: [],
    topProducts: [],
    topCategories: [],
    recentActivity: [],
    lowStockPreview: [],
    verduleria: { perishableCount: 0, wasteRecentQty: 0, weightSaleLines30d: 0 },
    almacen: { fastRotationCount: 0, avgMarginPercent: null },
    ferreteria: { staleCount: 0, categoryTop: null, lowStockTechnicalCount: 0 },
  };
}

function buildTrendSeries(
  salesRows: { total: string; created_at: string }[],
  movRows: { created_at: string }[]
): DailyTrendPoint[] {
  const salesByDay = new Map<string, number>();
  for (const s of salesRows) {
    const k = localDateKeyFromIso(s.created_at);
    salesByDay.set(k, (salesByDay.get(k) ?? 0) + Number(s.total));
  }
  const movByDay = new Map<string, number>();
  for (const m of movRows) {
    const k = localDateKeyFromIso(m.created_at);
    movByDay.set(k, (movByDay.get(k) ?? 0) + 1);
  }

  const out: DailyTrendPoint[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const dateKey = localDateKeyFromIso(d.toISOString());
    const label = d.toLocaleDateString(APP_LOCALE, { weekday: "short", day: "numeric" });
    out.push({
      dateKey,
      label,
      salesTotal: salesByDay.get(dateKey) ?? 0,
      movementsCount: movByDay.get(dateKey) ?? 0,
    });
  }
  return out;
}

export async function getDashboardMetrics(
  business: ActiveBusiness
): Promise<{
  businessType: BusinessType;
  metrics: DashboardMetrics;
}> {
  const supabase = await createClient();
  const businessId = business.id;
  const type = business.business_type;

  const meta = (m: unknown) => (m && typeof m === "object" ? (m as Record<string, unknown>) : {});

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select(
      "id,name,current_stock,min_stock,active,metadata,cost_price,sale_price,unit_type,categories(name)"
    )
    .eq("business_id", businessId);

  if (productsError) {
    return { businessType: type, metrics: emptyMetrics() };
  }

  const all = products ?? [];
  const active = all.filter((p) => p.active);
  const activeProducts = active.length;
  const lowStock = active.filter((p) => Number(p.current_stock) <= Number(p.min_stock)).length;

  const lowStockPreview = [...active]
    .filter((p) => Number(p.current_stock) <= Number(p.min_stock))
    .sort((a, b) => {
      const ra = Number(a.min_stock) - Number(a.current_stock);
      const rb = Number(b.min_stock) - Number(b.current_stock);
      return rb - ra;
    })
    .slice(0, 6)
    .map((p) => ({
      id: p.id,
      name: String((p as { name: string }).name),
      current_stock: p.current_stock,
      min_stock: p.min_stock,
      unit_type: p.unit_type,
    }));

  let estimatedCapital = 0;
  for (const p of active) {
    estimatedCapital += Number(p.current_stock) * Number(p.cost_price);
  }

  const since30 = daysAgoIso(30);
  const since7 = daysAgoIso(7);
  const trendStart = localDayStartIso(6);

  const [
    salesTodayRes,
    salesTrendRes,
    movTrendRes,
    recentMovementsRes,
    pendingAlertsRes,
    wasteRows,
    recentMoves30Res,
    movActivityRes,
    salesActivityRes,
    sales30Res,
  ] = await Promise.all([
    supabase
      .from("sales")
      .select("id,total,created_at")
      .eq("business_id", businessId)
      .gte("created_at", startOfLocalDay()),
    supabase
      .from("sales")
      .select("total,created_at")
      .eq("business_id", businessId)
      .gte("created_at", trendStart),
    supabase
      .from("stock_movements")
      .select("created_at")
      .eq("business_id", businessId)
      .gte("created_at", trendStart),
    supabase
      .from("stock_movements")
      .select("id", { count: "exact", head: true })
      .eq("business_id", businessId)
      .gte("created_at", since7),
    supabase
      .from("stock_alerts")
      .select("id", { count: "exact", head: true })
      .eq("business_id", businessId)
      .eq("resolved", false),
    supabase
      .from("stock_movements")
      .select("quantity")
      .eq("business_id", businessId)
      .eq("type", "waste")
      .gte("created_at", since7),
    supabase
      .from("stock_movements")
      .select("product_id")
      .eq("business_id", businessId)
      .gte("created_at", since30),
    supabase
      .from("stock_movements")
      .select("id, type, quantity, created_at, products(name)")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false })
      .limit(7),
    supabase
      .from("sales")
      .select("id, total, created_at")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("sales").select("id").eq("business_id", businessId).gte("created_at", since30),
  ]);

  const salesToday = salesTodayRes.data ?? [];
  const salesTodayCount = salesToday.length;
  const salesTodayTotal = salesToday.reduce((acc, s) => acc + Number(s.total), 0);

  const trend = buildTrendSeries(salesTrendRes.data ?? [], movTrendRes.data ?? []);
  const recentMovementsCount = recentMovementsRes.count ?? 0;
  const pendingAlertsCount = pendingAlertsRes.count ?? 0;

  const wasteRecentQty = (wasteRows.data ?? []).reduce(
    (acc, row) => acc + Math.abs(Number(row.quantity)),
    0
  );

  const recentlyMoved = new Set((recentMoves30Res.data ?? []).map((r) => r.product_id));
  const staleCount = active.filter(
    (p) => Number(p.current_stock) > 0 && !recentlyMoved.has(p.id)
  ).length;

  const perishableCount = active.filter((p) => meta(p.metadata).is_perishable === true).length;
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

  const byCategory = new Map<string, number>();
  for (const p of active) {
    const row = p as { categories?: { name: string } | null };
    const n = row.categories?.name ?? "Sin categoría";
    byCategory.set(n, (byCategory.get(n) ?? 0) + 1);
  }
  let categoryTop: { name: string; count: number } | null = null;
  for (const [name, count] of byCategory) {
    if (!categoryTop || count > categoryTop.count) {
      categoryTop = { name, count };
    }
  }
  const topCategories = [...byCategory.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([name, count]) => ({ name, count }));

  const weightIds = new Set(
    active.filter((p) => meta(p.metadata).allows_weight_sale === true).map((p) => p.id)
  );
  let weightSaleLines30d = 0;
  const saleIds30 = (sales30Res.data ?? []).map((s) => s.id);
  if (weightIds.size > 0 && saleIds30.length > 0) {
    const { data: linesW } = await supabase
      .from("sale_items")
      .select("product_id")
      .in("sale_id", saleIds30);
    weightSaleLines30d = (linesW ?? []).filter((l) => weightIds.has(l.product_id)).length;
  }

  const lowStockTechnicalCount = active.filter((p) => {
    const m = meta(p.metadata);
    const tech = Boolean(
      (typeof m.brand === "string" && m.brand) ||
        (typeof m.model === "string" && m.model) ||
        (typeof m.measure === "string" && m.measure)
    );
    return tech && Number(p.current_stock) <= Number(p.min_stock);
  }).length;

  let topProducts: TopProductRow[] = [];
  if (saleIds30.length > 0) {
    const { data: lines } = await supabase
      .from("sale_items")
      .select("product_id, subtotal, quantity, products(name)")
      .in("sale_id", saleIds30);
    const agg = new Map<string, { revenue: number; quantity: number; name: string }>();
    for (const line of lines ?? []) {
      const pid = line.product_id;
      const name = (line.products as { name: string } | null)?.name ?? "Producto";
      const cur = agg.get(pid) ?? { revenue: 0, quantity: 0, name };
      cur.revenue += Number(line.subtotal);
      cur.quantity += Math.abs(Number(line.quantity));
      cur.name = name;
      agg.set(pid, cur);
    }
    topProducts = [...agg.entries()]
      .map(([productId, v]) => ({
        productId,
        name: v.name,
        revenue: v.revenue,
        quantity: v.quantity,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }

  const activity: DashboardActivityItem[] = [
    ...(salesActivityRes.data ?? []).map((s) => ({
      kind: "sale" as const,
      id: s.id,
      at: s.created_at,
      total: Number(s.total),
    })),
    ...(movActivityRes.data ?? []).map((m) => {
      const pname = m.products as { name: string } | null;
      return {
        kind: "movement" as const,
        id: m.id,
        at: m.created_at,
        type: m.type,
        quantity: m.quantity,
        productName: pname?.name ?? null,
      };
    }),
  ]
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 8);

  return {
    businessType: type,
    metrics: {
      activeProducts,
      lowStock,
      salesTodayCount,
      salesTodayTotal,
      recentMovementsCount,
      pendingAlertsCount,
      estimatedCapital,
      trend,
      topProducts,
      topCategories,
      recentActivity: activity,
      lowStockPreview,
      verduleria: {
        perishableCount,
        wasteRecentQty,
        weightSaleLines30d,
      },
      almacen: { fastRotationCount, avgMarginPercent },
      ferreteria: { staleCount, categoryTop, lowStockTechnicalCount },
    },
  };
}
