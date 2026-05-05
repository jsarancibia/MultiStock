"use server";

import { redirect } from "next/navigation";
import { createAuditLog } from "@/lib/audit/create-audit-log";
import { canBusinessUseModule, getModuleUpgradeMessage } from "@/lib/billing/plan-guards";
import { humanizeActionError } from "@/lib/errors/action-error";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";
import { requireActiveBusiness } from "@/lib/business/get-active-business";
import { supplierSchema } from "@/lib/validations/supplier";

export type SupplierActionState = {
  message?: string;
  errors?: Record<string, string[]>;
};

export async function listSuppliers() {
  const user = await requireUser();
  const business = await requireActiveBusiness(user.id);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("suppliers")
    .select("id,name,phone,email,address,created_at")
    .eq("business_id", business.id)
    .order("name", { ascending: true });

  if (error) return [];
  return data ?? [];
}

export async function getSupplierById(supplierId: string) {
  const user = await requireUser();
  const business = await requireActiveBusiness(user.id);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("suppliers")
    .select("id,name,phone,email,address")
    .eq("id", supplierId)
    .eq("business_id", business.id)
    .maybeSingle();

  if (error) return null;
  return data;
}

export async function createSupplierAction(
  _prevState: SupplierActionState | undefined,
  formData: FormData
): Promise<SupplierActionState | undefined> {
  const user = await requireUser();
  const business = await requireActiveBusiness(user.id);
  if (!canBusinessUseModule(business, "suppliers")) {
    return { message: getModuleUpgradeMessage("Proveedores") };
  }

  const parsed = supplierSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    address: formData.get("address"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { data: created, error } = await supabase
    .from("suppliers")
    .insert({
      business_id: business.id,
      name: parsed.data.name,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      address: parsed.data.address || null,
    })
    .select("id")
    .single();

  if (error || !created) {
    return {
      message: humanizeActionError(
        error?.message,
        "No se pudo crear el proveedor."
      ),
    };
  }

  await createAuditLog({
    businessId: business.id,
    userId: user.id,
    entityType: "supplier",
    entityId: created.id,
    action: "created",
    summary: `Proveedor creado: ${parsed.data.name}`,
    afterData: { name: parsed.data.name },
  });

  redirect("/proveedores");
}

export async function updateSupplierAction(
  supplierId: string,
  _prevState: SupplierActionState | undefined,
  formData: FormData
): Promise<SupplierActionState | undefined> {
  const user = await requireUser();
  const business = await requireActiveBusiness(user.id);
  if (!canBusinessUseModule(business, "suppliers")) {
    return { message: getModuleUpgradeMessage("Proveedores") };
  }

  const parsed = supplierSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    address: formData.get("address"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("suppliers")
    .update({
      name: parsed.data.name,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      address: parsed.data.address || null,
    })
    .eq("id", supplierId)
    .eq("business_id", business.id);

  if (error) return { message: humanizeActionError(error.message, "No se pudo actualizar el proveedor.") };

  await createAuditLog({
    businessId: business.id,
    userId: user.id,
    entityType: "supplier",
    entityId: supplierId,
    action: "updated",
    summary: `Proveedor actualizado: ${parsed.data.name}`,
    afterData: {
      name: parsed.data.name,
      phone: parsed.data.phone ?? null,
      email: parsed.data.email ?? null,
    },
  });

  redirect("/proveedores");
}
