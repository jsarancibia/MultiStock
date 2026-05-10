"use server";

import { revalidatePath } from "next/cache";
import { createAuditLog } from "@/lib/audit/create-audit-log";
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

export async function countInactiveProducts() {
  const user = await requireUser();
  const business = await requireActiveBusiness(user.id);
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("business_id", business.id)
    .eq("active", false);

  if (error) return 0;
  return count ?? 0;
}

export async function reactivateAllInactiveProducts() {
  const user = await requireUser();
  const business = await requireActiveBusiness(user.id);
  const supabase = await createClient();

  const { data: inactiveProducts, error: fetchError } = await supabase
    .from("products")
    .select("id,name")
    .eq("business_id", business.id)
    .eq("active", false);

  if (fetchError) return { message: "Error al consultar productos inactivos." };

  if (!inactiveProducts || inactiveProducts.length === 0) {
    return { message: "No hay productos inactivos para reactivar." };
  }

  const { error: updateError } = await supabase
    .from("products")
    .update({ active: true })
    .eq("business_id", business.id)
    .eq("active", false);

  if (updateError) {
    return { message: "Error al reactivar productos." };
  }

  for (const product of inactiveProducts) {
    await createAuditLog({
      businessId: business.id,
      userId: user.id,
      entityType: "product",
      entityId: product.id,
      action: "updated" as const,
      summary: `Producto reactivado automáticamente (corrección de bug): ${product.name}`,
      beforeData: { active: false },
      afterData: { active: true },
    });
  }

  revalidatePath("/inventario");
  revalidatePath("/productos");

  return {
    success: true,
    message: `${inactiveProducts.length} producto(s) reactivado(s).`,
  };
}
