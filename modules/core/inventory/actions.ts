"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";
import { requireActiveBusiness } from "@/lib/business/get-active-business";

export async function listInventoryProducts() {
  const user = await requireUser();
  const business = await requireActiveBusiness(user.id);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("id,name,unit_type,current_stock,min_stock,sku,barcode,metadata")
    .eq("business_id", business.id)
    .eq("active", true)
    .order("name");

  if (error) return [];
  return data ?? [];
}

export async function listLowStockProducts() {
  const products = await listInventoryProducts();
  return products.filter((product) => Number(product.current_stock) <= Number(product.min_stock));
}
