import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export type ProductExportSource = {
  name: string;
  sku: string | null;
  barcode: string | null;
  unit_type: string;
  sale_price: string | number | null;
  active: boolean;
  current_stock?: string | number | null;
  min_stock?: string | number | null;
  categories: { name: string | null } | null;
};

/** Filas fuente únicas para exportaciones CSV. */
export async function loadExportSourceRows(supabase: SupabaseClient<Database>, businessId: string) {
  const [products, inventoryProducts, movements, sales, alerts] = await Promise.all([
    supabase
      .from("products")
      .select("name,sku,barcode,unit_type,sale_price,active,categories(name)")
      .eq("business_id", businessId),
    supabase
      .from("products")
      .select("name,sku,barcode,current_stock,min_stock,unit_type,categories(name)")
      .eq("business_id", businessId),
    supabase
      .from("stock_movements")
      .select("created_at,type,quantity,reason")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false })
      .limit(1000),
    supabase
      .from("sales")
      .select("created_at,total,payment_method")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false })
      .limit(1000),
    supabase
      .from("stock_alerts")
      .select("created_at,type,message,resolved")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false })
      .limit(1000),
  ]);

  return {
    products: (products.data ?? []) as ProductExportSource[],
    inventoryProducts: (inventoryProducts.data ?? []) as ProductExportSource[],
    movements: movements.data ?? [],
    sales: sales.data ?? [],
    alerts: alerts.data ?? [],
  };
}

export function categoryLabel(row: Pick<ProductExportSource, "categories">): string {
  const c = row.categories;
  const name = Array.isArray(c) ? (c as { name: string | null }[])[0]?.name : c?.name;
  const t = typeof name === "string" ? name.trim() : "";
  return t || "—";
}
