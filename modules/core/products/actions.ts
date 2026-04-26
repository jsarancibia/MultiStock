"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";
import { requireActiveBusiness } from "@/lib/business/get-active-business";
import { productFiltersSchema, productSchema } from "@/lib/validations/product";
import type { BusinessType } from "@/config/business-types";
import { isLowMargin } from "@/lib/business/business-type-config";
import { createStockMovement } from "@/modules/core/stock-movements/actions";
import type { Json } from "@/types/database";

export type ProductActionState = {
  message?: string;
  errors?: Record<string, string[]>;
};

/** Fase 8: aviso de producto perecible con vida util definida. */
async function syncPerishableProductAlert(
  supabase: Awaited<ReturnType<typeof createClient>>,
  businessId: string,
  productId: string,
  businessType: BusinessType,
  metadata: Record<string, unknown>
) {
  if (businessType !== "verduleria") return;
  const isPer = metadata.is_perishable === true;
  const days = Number(metadata.expiration_days) || 0;
  if (isPer && days > 0) {
    const { data: row } = await supabase
      .from("stock_alerts")
      .select("id")
      .eq("business_id", businessId)
      .eq("product_id", productId)
      .eq("type", "perishable_warning")
      .eq("resolved", false)
      .maybeSingle();
    if (row) {
      await supabase
        .from("stock_alerts")
        .update({
          message: `Perecible: vida util ${days} dia(s) configurada. Revisar vencimientos.`,
        })
        .eq("id", row.id);
    } else {
      await supabase.from("stock_alerts").insert({
        business_id: businessId,
        product_id: productId,
        type: "perishable_warning",
        message: `Perecible: vida util ${days} dia(s) configurada. Revisar vencimientos.`,
        resolved: false,
      });
    }
    return;
  }
  await supabase
    .from("stock_alerts")
    .update({ resolved: true })
    .eq("business_id", businessId)
    .eq("product_id", productId)
    .eq("type", "perishable_warning")
    .eq("resolved", false);
}

function buildMetadataFromFormData(formData: FormData, businessType: BusinessType) {
  if (businessType === "verduleria") {
    return {
      is_perishable: formData.get("is_perishable") === "on",
      expiration_days: Number(formData.get("expiration_days") || 0),
      allows_weight_sale: formData.get("allows_weight_sale") === "on",
      waste_tracking: formData.get("waste_tracking") === "on",
    };
  }

  if (businessType === "almacen") {
    return {
      fast_rotation: formData.get("fast_rotation") === "on",
      suggested_margin: Number(formData.get("suggested_margin") || 0),
      commercial_category: String(formData.get("commercial_category") || ""),
    };
  }

  return {
    brand: String(formData.get("brand") || ""),
    model: String(formData.get("model") || ""),
    material: String(formData.get("material") || ""),
    measure: String(formData.get("measure") || ""),
    technical_specs: String(formData.get("technical_specs") || ""),
  };
}

export async function listProducts(rawFilters: Record<string, string | undefined>) {
  const user = await requireUser();
  const business = await requireActiveBusiness(user.id);
  const supabase = await createClient();
  const filters = productFiltersSchema.parse(rawFilters);

  const qRaw = (filters.q ?? "").trim();
  const q = qRaw.replace(/%/g, "");

  let query = supabase
    .from("products")
    .select(
      "id,name,sku,barcode,unit_type,sale_price,cost_price,current_stock,min_stock,active,created_at,metadata,categories(name),suppliers(name)"
    )
    .eq("business_id", business.id)
    .order("created_at", { ascending: false });

  if (q) {
    if (business.business_type === "ferreteria") {
      query = query.or(
        `name.ilike.%${q}%,sku.ilike.%${q}%,barcode.ilike.%${q}%,metadata->>brand.ilike.%${q}%,metadata->>model.ilike.%${q}%,metadata->>measure.ilike.%${q}%`
      );
    } else {
      query = query.or(`name.ilike.%${q}%,sku.ilike.%${q}%,barcode.ilike.%${q}%`);
    }
  }
  if (filters.categoryId) query = query.eq("category_id", filters.categoryId);
  if (filters.supplierId) query = query.eq("supplier_id", filters.supplierId);
  if (filters.status === "active") query = query.eq("active", true);
  if (filters.status === "inactive") query = query.eq("active", false);
  if (filters.focus === "stale" && business.business_type === "ferreteria") {
    query = query.eq("active", true);
  }
  if (filters.focus === "perishable" && business.business_type === "verduleria") {
    query = query.contains("metadata", { is_perishable: true });
  }
  if (filters.focus === "fast_rotation" && business.business_type === "almacen") {
    query = query.contains("metadata", { fast_rotation: true });
  }

  const { data, error } = await query;
  if (error) return { products: [], business };

  type Row = (NonNullable<typeof data>[number]) & { metadata: unknown; cost_price: string };
  let products: Row[] = (data ?? []) as Row[];

  if (filters.focus === "low_margin" && business.business_type === "almacen") {
    products = products.filter((p) => {
      const cost = Number(p.cost_price);
      const sale = Number(p.sale_price);
      const meta = p.metadata as Record<string, unknown> | null;
      const s = meta?.suggested_margin;
      const sp = typeof s === "number" ? s : Number(s) || undefined;
      return isLowMargin(cost, sale, sp);
    });
  }

  if (filters.focus === "stale" && business.business_type === "ferreteria") {
    const since = new Date();
    since.setDate(since.getDate() - 30);
    const { data: moves } = await supabase
      .from("stock_movements")
      .select("product_id")
      .eq("business_id", business.id)
      .gte("created_at", since.toISOString());
    const moved = new Set((moves ?? []).map((m) => m.product_id));
    products = products.filter(
      (p) => p.active && Number(p.current_stock) > 0 && !moved.has(p.id)
    );
  }

  return { products, business };
}

export async function getProductById(productId: string) {
  const user = await requireUser();
  const business = await requireActiveBusiness(user.id);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("*,categories(name),suppliers(name)")
    .eq("id", productId)
    .eq("business_id", business.id)
    .maybeSingle();

  if (error) return null;
  return data;
}

export async function getProductFormData() {
  const user = await requireUser();
  const business = await requireActiveBusiness(user.id);
  const supabase = await createClient();

  const [{ data: categories }, { data: suppliers }] = await Promise.all([
    supabase.from("categories").select("id,name").eq("business_id", business.id).order("name"),
    supabase.from("suppliers").select("id,name").eq("business_id", business.id).order("name"),
  ]);

  return {
    business,
    categories: categories ?? [],
    suppliers: suppliers ?? [],
  };
}

export async function createProductAction(
  _prevState: ProductActionState | undefined,
  formData: FormData
): Promise<ProductActionState | undefined> {
  const user = await requireUser();
  const business = await requireActiveBusiness(user.id);
  const metadata = buildMetadataFromFormData(formData, business.business_type);

  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    categoryId: formData.get("categoryId"),
    supplierId: formData.get("supplierId"),
    sku: formData.get("sku"),
    barcode: formData.get("barcode"),
    unitType: formData.get("unitType"),
    costPrice: formData.get("costPrice"),
    salePrice: formData.get("salePrice"),
    minStock: formData.get("minStock"),
    currentStock: formData.get("currentStock"),
    active: formData.get("active") === "on",
    businessType: business.business_type,
    metadata,
  });

  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { data: product, error } = await supabase
    .from("products")
    .insert({
      business_id: business.id,
      category_id: parsed.data.categoryId || null,
      supplier_id: parsed.data.supplierId || null,
      name: parsed.data.name,
      sku: parsed.data.sku || null,
      barcode: parsed.data.barcode || null,
      unit_type: parsed.data.unitType,
      cost_price: String(parsed.data.costPrice),
      sale_price: String(parsed.data.salePrice),
      min_stock: String(parsed.data.minStock),
      current_stock: "0",
      active: parsed.data.active,
      business_type: business.business_type,
      metadata: parsed.data.metadata as Json,
    })
    .select("id")
    .single();

  if (error || !product) return { message: error?.message ?? "No se pudo crear el producto." };

  await syncPerishableProductAlert(
    supabase,
    business.id,
    product.id,
    business.business_type,
    parsed.data.metadata as Record<string, unknown>
  );

  if (parsed.data.currentStock > 0) {
    const movementResult = await createStockMovement({
      productId: product.id,
      type: "initial_stock",
      quantity: parsed.data.currentStock,
      reason: "Stock inicial al crear producto",
    });

    if (!movementResult.ok) {
      return { message: movementResult.message };
    }
  }

  redirect("/productos");
}

export async function updateProductAction(
  productId: string,
  _prevState: ProductActionState | undefined,
  formData: FormData
): Promise<ProductActionState | undefined> {
  const user = await requireUser();
  const business = await requireActiveBusiness(user.id);
  const metadata = buildMetadataFromFormData(formData, business.business_type);

  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    categoryId: formData.get("categoryId"),
    supplierId: formData.get("supplierId"),
    sku: formData.get("sku"),
    barcode: formData.get("barcode"),
    unitType: formData.get("unitType"),
    costPrice: formData.get("costPrice"),
    salePrice: formData.get("salePrice"),
    minStock: formData.get("minStock"),
    currentStock: formData.get("currentStock"),
    active: formData.get("active") === "on",
    businessType: business.business_type,
    metadata,
  });

  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({
      category_id: parsed.data.categoryId || null,
      supplier_id: parsed.data.supplierId || null,
      name: parsed.data.name,
      sku: parsed.data.sku || null,
      barcode: parsed.data.barcode || null,
      unit_type: parsed.data.unitType,
      cost_price: String(parsed.data.costPrice),
      sale_price: String(parsed.data.salePrice),
      min_stock: String(parsed.data.minStock),
      active: parsed.data.active,
      metadata: parsed.data.metadata as Json,
    })
    .eq("id", productId)
    .eq("business_id", business.id);

  if (error) return { message: error.message };

  await syncPerishableProductAlert(
    supabase,
    business.id,
    productId,
    business.business_type,
    parsed.data.metadata as Record<string, unknown>
  );

  redirect(`/productos/${productId}`);
}

export async function deactivateProductAction(productId: string) {
  const user = await requireUser();
  const business = await requireActiveBusiness(user.id);
  const supabase = await createClient();
  await supabase.from("products").update({ active: false }).eq("id", productId).eq("business_id", business.id);
  redirect("/productos");
}
