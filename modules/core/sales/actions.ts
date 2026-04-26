"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";
import { requireActiveBusiness } from "@/lib/business/get-active-business";
import { createSaleSchema } from "@/lib/validations/sale";

export type SaleActionState = {
  message?: string;
  errors?: Record<string, string[]>;
};

const DECIMAL_UNITS = new Set(["kg", "g", "liter", "meter"]);

type ProductFromDb = {
  id: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  unit_type: string;
  current_stock: string;
  sale_price: string;
  active: boolean;
  metadata: Record<string, unknown> | null;
};

export type SaleFormProduct = {
  id: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  unit_type: string;
  current_stock: string;
  sale_price: string;
  brand: string | null;
  model: string | null;
  measure: string | null;
};

function strMeta(v: unknown) {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

function mapProductForSale(row: ProductFromDb): SaleFormProduct {
  const meta = (row.metadata ?? {}) as Record<string, unknown>;
  return {
    id: row.id,
    name: row.name,
    sku: row.sku,
    barcode: row.barcode,
    unit_type: row.unit_type,
    current_stock: row.current_stock,
    sale_price: row.sale_price,
    brand: strMeta(meta.brand),
    model: strMeta(meta.model),
    measure: strMeta(meta.measure),
  };
}

function sortProductsForAlmacen(products: ProductFromDb[]): ProductFromDb[] {
  return [...products].sort((a, b) => {
    const aFast = Boolean((a.metadata as Record<string, unknown> | null)?.fast_rotation);
    const bFast = Boolean((b.metadata as Record<string, unknown> | null)?.fast_rotation);
    if (aFast === bFast) return a.name.localeCompare(b.name, "es");
    return aFast ? -1 : 1;
  });
}

export async function listSales() {
  const user = await requireUser();
  const business = await requireActiveBusiness(user.id);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("sales")
    .select("id,total,payment_method,created_at,created_by,sale_items(quantity,subtotal,products(name))")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data ?? [];
}

export async function getSaleById(saleId: string) {
  const user = await requireUser();
  const business = await requireActiveBusiness(user.id);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("sales")
    .select(
      "id,total,payment_method,created_at,created_by,sale_items(id,quantity,unit_price,subtotal,products(id,name,unit_type,sku,barcode))"
    )
    .eq("id", saleId)
    .eq("business_id", business.id)
    .maybeSingle();

  if (error) return null;
  return data;
}

export async function getSaleFormData() {
  const user = await requireUser();
  const business = await requireActiveBusiness(user.id);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("id,name,sku,barcode,unit_type,current_stock,sale_price,active,metadata")
    .eq("business_id", business.id)
    .eq("active", true)
    .order("name");

  if (error) {
    return {
      business,
      products: [] as SaleFormProduct[],
    };
  }

  const rows = (data ?? []) as ProductFromDb[];
  const ordered = business.business_type === "almacen" ? sortProductsForAlmacen(rows) : rows;
  return {
    business,
    products: ordered.map(mapProductForSale),
  };
}

export async function createSaleAction(
  _prevState: SaleActionState | undefined,
  formData: FormData
): Promise<SaleActionState | undefined> {
  const user = await requireUser();
  const business = await requireActiveBusiness(user.id);
  const supabase = await createClient();

  let parsedItems: unknown[] = [];

  try {
    const rawItems = String(formData.get("items") ?? "[]");
    parsedItems = JSON.parse(rawItems);
  } catch {
    return { message: "No se pudieron leer los items de la venta." };
  }

  const parsed = createSaleSchema.safeParse({
    paymentMethod: formData.get("paymentMethod"),
    items: parsedItems,
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const productIds = parsed.data.items.map((item) => item.productId);
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id,name,unit_type,current_stock,active")
    .eq("business_id", business.id)
    .in("id", productIds);

  if (productsError) {
    return { message: "No se pudieron validar los productos de la venta." };
  }

  const productsById = new Map((products ?? []).map((product) => [product.id, product]));

  for (const item of parsed.data.items) {
    const product = productsById.get(item.productId);
    if (!product) {
      return { message: "Uno de los productos no existe en el negocio activo." };
    }
    if (!product.active) {
      return { message: `El producto ${product.name} esta inactivo y no puede venderse.` };
    }
    if (!DECIMAL_UNITS.has(product.unit_type) && !Number.isInteger(item.quantity)) {
      return { message: `El producto ${product.name} solo admite cantidades enteras.` };
    }
    if (item.quantity > Number(product.current_stock)) {
      return { message: `Stock insuficiente para ${product.name}.` };
    }
  }

  const payloadItems = parsed.data.items.map((item) => ({
    product_id: item.productId,
    quantity: item.quantity,
    unit_price: item.unitPrice,
  }));

  const { data: saleId, error: rpcError } = await supabase.rpc("create_sale_with_items", {
    p_business_id: business.id,
    p_created_by: user.id,
    p_payment_method: parsed.data.paymentMethod,
    p_items: payloadItems,
  });

  if (rpcError || !saleId) {
    return { message: rpcError?.message ?? "No se pudo registrar la venta." };
  }

  redirect(`/ventas/${saleId}`);
}
