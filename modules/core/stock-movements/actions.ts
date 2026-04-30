"use server";

import { redirect } from "next/navigation";
import { createAuditLog } from "@/lib/audit/create-audit-log";
import { movementTypeLabel } from "@/lib/business/movement-type-labels";
import { humanizeActionError } from "@/lib/errors/action-error";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";
import { requireActiveBusiness } from "@/lib/business/get-active-business";
import { stockMovementSchema, type StockMovementInput } from "@/lib/validations/stock-movement";

export type StockMovementActionState = {
  message?: string;
  errors?: Record<string, string[]>;
};

const DECIMAL_UNITS = new Set(["kg", "g", "liter", "meter"]);
const INCREASE_TYPES = new Set(["initial_stock", "purchase", "return"]);
const DECREASE_TYPES = new Set(["waste"]);

function normalizeDelta(type: StockMovementInput["type"], quantity: number) {
  if (type === "adjustment") return quantity;
  if (INCREASE_TYPES.has(type)) return Math.abs(quantity);
  if (DECREASE_TYPES.has(type)) return -Math.abs(quantity);
  return quantity;
}

function validateQuantityByUnit(unitType: string, quantity: number) {
  if (DECIMAL_UNITS.has(unitType)) return true;
  return Number.isInteger(quantity);
}

async function syncLowStockAlert(productId: string, businessId: string, currentStock: number, minStock: number) {
  const supabase = await createClient();
  const shouldHaveAlert = currentStock <= minStock;

  if (shouldHaveAlert) {
    const { data: existing } = await supabase
      .from("stock_alerts")
      .select("id")
      .eq("business_id", businessId)
      .eq("product_id", productId)
      .eq("type", "low_stock")
      .eq("resolved", false)
      .maybeSingle();

    if (!existing) {
      await supabase.from("stock_alerts").insert({
        business_id: businessId,
        product_id: productId,
        type: "low_stock",
        message: "Producto en o por debajo de stock minimo.",
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
    .eq("type", "low_stock")
    .eq("resolved", false);
}

export async function createStockMovement(input: StockMovementInput) {
  const user = await requireUser();
  const business = await requireActiveBusiness(user.id);
  const supabase = await createClient();

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id,name,current_stock,min_stock,unit_type,active")
    .eq("id", input.productId)
    .eq("business_id", business.id)
    .maybeSingle();

  if (productError || !product) {
    return { ok: false as const, message: "Producto no encontrado." };
  }

  if (!product.active) {
    return { ok: false as const, message: "No puedes mover stock de un producto inactivo." };
  }

  if (!validateQuantityByUnit(product.unit_type, input.quantity)) {
    return { ok: false as const, message: `La unidad ${product.unit_type} solo admite cantidades enteras.` };
  }

  const delta = normalizeDelta(input.type, input.quantity);
  const currentStock = Number(product.current_stock);
  const minStock = Number(product.min_stock);
  const newStock = currentStock + delta;

  if (newStock < 0) {
    return { ok: false as const, message: "No se permite stock negativo." };
  }

  const { data: insertedMovement, error: movementError } = await supabase
    .from("stock_movements")
    .insert({
      business_id: business.id,
      product_id: input.productId,
      type: input.type,
      quantity: String(delta),
      reason: input.reason || null,
      unit_cost: input.unitCost === undefined ? null : String(input.unitCost),
      created_by: user.id,
    })
    .select("id")
    .single();

  if (movementError || !insertedMovement) {
    return {
      ok: false as const,
      message: humanizeActionError(
        movementError?.message,
        "No se pudo registrar el movimiento."
      ),
    };
  }

  const { error: updateError } = await supabase
    .from("products")
    .update({ current_stock: String(newStock) })
    .eq("id", input.productId)
    .eq("business_id", business.id);

  if (updateError) {
    return { ok: false as const, message: humanizeActionError(updateError.message) };
  }

  await syncLowStockAlert(input.productId, business.id, newStock, minStock);

  await createAuditLog({
    businessId: business.id,
    userId: user.id,
    entityType: "stock_movement",
    entityId: insertedMovement.id,
    action: "stock_changed",
    summary: `${movementTypeLabel(input.type)} · ${product.name}: Δ ${delta} (stock ${currentStock} → ${newStock})`,
    afterData: {
      type: input.type,
      quantity: String(delta),
      product_id: input.productId,
    },
    metadata: { reason: input.reason ?? null },
  });

  return { ok: true as const };
}

export async function createStockMovementAction(
  _prevState: StockMovementActionState | undefined,
  formData: FormData
): Promise<StockMovementActionState | undefined> {
  const parsed = stockMovementSchema.safeParse({
    productId: formData.get("productId"),
    type: formData.get("type"),
    quantity: formData.get("quantity"),
    reason: formData.get("reason"),
    unitCost: formData.get("unitCost") ? formData.get("unitCost") : undefined,
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const result = await createStockMovement(parsed.data);
  if (!result.ok) return { message: result.message };
  redirect("/inventario/movimientos");
}

export async function listStockMovements(productId?: string) {
  const user = await requireUser();
  const business = await requireActiveBusiness(user.id);
  const supabase = await createClient();

  let query = supabase
    .from("stock_movements")
    .select("id,type,quantity,reason,unit_cost,created_at,products(name)")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false });

  if (productId) {
    query = query.eq("product_id", productId);
  }

  const { data, error } = await query;
  if (error) return [];
  return data ?? [];
}

export async function getMovementFormData() {
  const user = await requireUser();
  const business = await requireActiveBusiness(user.id);
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("id,name,unit_type,current_stock,barcode")
    .eq("business_id", business.id)
    .eq("active", true)
    .order("name");

  return {
    products: data ?? [],
  };
}
