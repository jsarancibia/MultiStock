"use server";

import { requireUser } from "@/lib/auth/session";
import { requireActiveBusiness } from "@/lib/business/get-active-business";
import { createClient } from "@/lib/supabase/server";

function csvEscape(value: string | number | boolean | null | undefined) {
  const text = value == null ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

type ProductRelation = { name: string | null } | { name: string | null }[] | null;

type SaleItemReport = {
  quantity: string | number;
  subtotal: string | number;
  products: ProductRelation;
};

function productRelationName(product: ProductRelation) {
  if (Array.isArray(product)) return product[0]?.name ?? "Sin nombre";
  return product?.name ?? "Sin nombre";
}

export async function getSimpleReports() {
  const user = await requireUser();
  const business = await requireActiveBusiness(user.id);
  const supabase = await createClient();

  const [salesByDay, salesWithItems, productsForStock, movements, waste] = await Promise.all([
    supabase
      .from("sales")
      .select("created_at,total")
      .eq("business_id", business.id)
      .order("created_at", { ascending: false })
      .limit(200),
    supabase
      .from("sales")
      .select("sale_items(quantity,subtotal,products(name))")
      .eq("business_id", business.id)
      .order("created_at", { ascending: false })
      .limit(200),
    supabase
      .from("products")
      .select("id,name,current_stock,min_stock,unit_type")
      .eq("business_id", business.id),
    supabase
      .from("stock_movements")
      .select("created_at,type,quantity")
      .eq("business_id", business.id)
      .order("created_at", { ascending: false })
      .limit(500),
    supabase
      .from("stock_movements")
      .select("created_at,quantity,products(name)")
      .eq("business_id", business.id)
      .eq("type", "waste")
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  const salesSummary = new Map<string, number>();
  for (const sale of salesByDay.data ?? []) {
    const day = sale.created_at.slice(0, 10);
    salesSummary.set(day, (salesSummary.get(day) ?? 0) + Number(sale.total));
  }

  const topProductMap = new Map<string, { quantity: number; revenue: number }>();
  for (const sale of salesWithItems.data ?? []) {
    const items = (sale.sale_items ?? []) as SaleItemReport[];
    for (const item of items) {
      const name = productRelationName(item.products);
      const current = topProductMap.get(name) ?? { quantity: 0, revenue: 0 };
      current.quantity += Number(item.quantity);
      current.revenue += Number(item.subtotal);
      topProductMap.set(name, current);
    }
  }

  const movementByDay = new Map<string, number>();
  for (const movement of movements.data ?? []) {
    const day = movement.created_at.slice(0, 10);
    movementByDay.set(day, (movementByDay.get(day) ?? 0) + 1);
  }

  const wasteByDay = new Map<string, number>();
  for (const movement of waste.data ?? []) {
    const day = movement.created_at.slice(0, 10);
    wasteByDay.set(day, (wasteByDay.get(day) ?? 0) + Math.abs(Number(movement.quantity)));
  }

  return {
    salesByDay: [...salesSummary.entries()]
      .map(([day, total]) => ({ day, total }))
      .sort((a, b) => b.day.localeCompare(a.day))
      .slice(0, 30),
    topProducts: [...topProductMap.entries()]
      .map(([name, value]) => ({ name, ...value }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10),
    lowStock: (productsForStock.data ?? [])
      .filter((p) => Number(p.current_stock) <= Number(p.min_stock))
      .map((p) => ({
        id: p.id,
        name: p.name,
        currentStock: Number(p.current_stock),
        minStock: Number(p.min_stock),
        unitType: p.unit_type,
      })),
    movementsByDay: [...movementByDay.entries()]
      .map(([day, count]) => ({ day, count }))
      .sort((a, b) => b.day.localeCompare(a.day))
      .slice(0, 30),
    wasteByDay: [...wasteByDay.entries()]
      .map(([day, quantity]) => ({ day, quantity }))
      .sort((a, b) => b.day.localeCompare(a.day))
      .slice(0, 30),
  };
}

export async function getCsvExports() {
  const user = await requireUser();
  const business = await requireActiveBusiness(user.id);
  const supabase = await createClient();

  const [products, inventory, movements, sales, alerts] = await Promise.all([
    supabase.from("products").select("name,sku,barcode,unit_type,sale_price,active").eq("business_id", business.id),
    supabase.from("products").select("name,current_stock,min_stock,unit_type").eq("business_id", business.id),
    supabase.from("stock_movements").select("created_at,type,quantity,reason").eq("business_id", business.id).order("created_at", { ascending: false }).limit(1000),
    supabase.from("sales").select("created_at,total,payment_method").eq("business_id", business.id).order("created_at", { ascending: false }).limit(1000),
    supabase.from("stock_alerts").select("created_at,type,message,resolved").eq("business_id", business.id).order("created_at", { ascending: false }).limit(1000),
  ]);

  const toCsv = (headers: string[], rows: Array<Array<string | number | boolean | null | undefined>>) =>
    [headers.map(csvEscape).join(","), ...rows.map((row) => row.map(csvEscape).join(","))].join("\n");

  return {
    productos: toCsv(
      ["nombre", "sku", "barcode", "unidad", "precio_venta", "activo"],
      (products.data ?? []).map((p) => [p.name, p.sku, p.barcode, p.unit_type, p.sale_price, p.active])
    ),
    inventario: toCsv(
      ["nombre", "stock_actual", "stock_minimo", "unidad"],
      (inventory.data ?? []).map((p) => [p.name, p.current_stock, p.min_stock, p.unit_type])
    ),
    movimientos: toCsv(
      ["fecha", "tipo", "cantidad", "motivo"],
      (movements.data ?? []).map((m) => [m.created_at, m.type, m.quantity, m.reason])
    ),
    ventas: toCsv(
      ["fecha", "total", "metodo_pago"],
      (sales.data ?? []).map((s) => [s.created_at, s.total, s.payment_method])
    ),
    alertas: toCsv(
      ["fecha", "tipo", "mensaje", "resuelta"],
      (alerts.data ?? []).map((a) => [a.created_at, a.type, a.message, a.resolved])
    ),
  };
}
