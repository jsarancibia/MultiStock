"use server";

import { redirect } from "next/navigation";
import { humanizeActionError } from "@/lib/errors/action-error";
import { createClient } from "@/lib/supabase/server";
import { onboardingSchema } from "@/lib/validations/business";
import { requireUser } from "@/lib/auth/session";
import { getActiveBusiness } from "@/lib/business/get-active-business";

export type OnboardingActionState = {
  message?: string;
  errors?: Record<string, string[]>;
};

export async function createBusinessAction(
  _prevState: OnboardingActionState | undefined,
  formData: FormData
): Promise<OnboardingActionState | undefined> {
  const user = await requireUser();
  const existing = await getActiveBusiness(user.id);

  if (existing) {
    redirect("/dashboard");
  }

  const parsed = onboardingSchema.safeParse({
    name: formData.get("name"),
    businessType: formData.get("businessType"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();

  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .insert({
      name: parsed.data.name,
      business_type: parsed.data.businessType,
      owner_id: user.id,
      subscription_plan: "free",
    })
    .select("id")
    .single();

  if (businessError || !business) {
    return {
      message: humanizeActionError(
        businessError?.message,
        "No se pudo crear el negocio."
      ),
    };
  }

  const { error: membershipError } = await supabase.from("business_users").upsert(
    {
      business_id: business.id,
      user_id: user.id,
      role: "owner",
    },
    {
      onConflict: "business_id,user_id",
      ignoreDuplicates: true,
    }
  );

  if (membershipError) {
    return { message: humanizeActionError(membershipError.message) };
  }

  redirect("/dashboard");
}
