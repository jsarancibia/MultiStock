"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";
import { requireActiveBusiness } from "@/lib/business/get-active-business";
import { categorySchema } from "@/lib/validations/category";

export type CategoryActionState = {
  message?: string;
  errors?: Record<string, string[]>;
};

export async function listCategories() {
  const user = await requireUser();
  const business = await requireActiveBusiness(user.id);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("id,name,business_type")
    .eq("business_id", business.id)
    .order("name", { ascending: true });

  if (error) return [];
  return data ?? [];
}

export async function createCategoryAction(
  _prevState: CategoryActionState | undefined,
  formData: FormData
): Promise<CategoryActionState | undefined> {
  const user = await requireUser();
  const business = await requireActiveBusiness(user.id);
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    businessType: formData.get("businessType") ?? business.business_type,
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("categories").insert({
    business_id: business.id,
    name: parsed.data.name,
    business_type: parsed.data.businessType,
  });

  if (error) {
    return { message: error.message };
  }

  return { message: "Categoria creada." };
}
