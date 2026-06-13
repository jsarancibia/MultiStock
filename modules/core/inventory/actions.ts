"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";
import { requireActiveBusiness } from "@/lib/business/get-active-business";

export type InventoryProduct = {
  id: string;
  name: string;
  unit_type: string;
  current_stock: string;
  min_stock: string;
  sku: string | null;
  barcode: string | null;
  metadata: unknown;
};

export async function listInventoryProducts(rawParams?: Record<string, string | undefined>) {
  const user = await requireUser();
  const business = await requireActiveBusiness(user.id);
  const supabase = await createClient();

  const page = Math.max(1, Number(rawParams?.page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(rawParams?.pageSize) || 50));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("products")
    .select("id,name,unit_type,current_stock,min_stock,sku,barcode,metadata", { count: "exact" })
    .eq("business_id", business.id)
    .eq("active", true)
    .order("name")
    .range(from, to);

  if (error) return { products: [], lowStockCount: 0, totalCount: 0, page, pageSize, totalPages: 0 };

  const products = (data ?? []) as InventoryProduct[];
  const totalCount = count ?? 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const { data: lowStockData } = await supabase
    .from("products")
    .select("current_stock,min_stock")
    .eq("business_id", business.id)
    .eq("active", true);
  const lowStockFiltered = (lowStockData ?? []).filter(
    (p) => Number(p.current_stock) <= Number(p.min_stock)
  );

  return { products, lowStockCount: lowStockFiltered.length, totalCount, page, pageSize, totalPages };
}
