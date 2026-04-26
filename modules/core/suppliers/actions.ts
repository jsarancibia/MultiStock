"use server";

import { redirect } from "next/navigation";
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
  const { error } = await supabase.from("suppliers").insert({
    business_id: business.id,
    name: parsed.data.name,
    phone: parsed.data.phone || null,
    email: parsed.data.email || null,
    address: parsed.data.address || null,
  });

  if (error) return { message: error.message };
  redirect("/proveedores");
}

export async function updateSupplierAction(
  supplierId: string,
  _prevState: SupplierActionState | undefined,
  formData: FormData
): Promise<SupplierActionState | undefined> {
  const user = await requireUser();
  const business = await requireActiveBusiness(user.id);
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

  if (error) return { message: error.message };
  redirect("/proveedores");
}
