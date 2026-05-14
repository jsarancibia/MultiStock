"use server";

import { redirect } from "next/navigation";
import { humanizeActionError } from "@/lib/errors/action-error";
import { createClient } from "@/lib/supabase/server";
import { loginSchema, registerSchema } from "@/lib/validations/auth";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

async function linkPendingInvitations(
  supabase: SupabaseClient<Database>,
  email: string
) {
  const { data: pendingInvites } = await supabase
    .from("pending_invitations")
    .select("business_id")
    .eq("email", email);

  if (!pendingInvites || pendingInvites.length === 0) return;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (!profile) return;

  for (const invite of pendingInvites) {
    const { error: linkError } = await supabase.from("business_users").upsert(
      {
        business_id: invite.business_id,
        user_id: profile.id,
        role: "employee",
      },
      { onConflict: "business_id,user_id", ignoreDuplicates: true }
    );

    if (linkError) {
      console.error("linkPendingInvitations (business_users upsert):", linkError.message);
    }
  }

  // Limpiar invitaciones pendientes
  await supabase
    .from("pending_invitations")
    .delete()
    .eq("email", email);
}

export type AuthActionState = {
  message?: string;
  errors?: Record<string, string[]>;
};

export async function loginAction(
  _prevState: AuthActionState | undefined,
  formData: FormData
): Promise<AuthActionState | undefined> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { message: "Credenciales invalidas o usuario no confirmado." };
  }

  // Verificar si tiene invitaciones pendientes → vincularlo automaticamente
  await linkPendingInvitations(supabase, parsed.data.email);

  redirect("/dashboard");
}

export async function registerAction(
  _prevState: AuthActionState | undefined,
  formData: FormData
): Promise<AuthActionState | undefined> {
  const parsed = registerSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error: signUpError } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
    },
  });

  if (signUpError) {
    return { message: humanizeActionError(signUpError.message, "No se pudo crear la cuenta.") };
  }

  // Vincular invitaciones pendientes (el perfil se crea via trigger)
  await linkPendingInvitations(supabase, parsed.data.email);

  // Intentamos iniciar sesion automaticamente para ir al dashboard.
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (signInError) {
    return {
      message:
        "Cuenta creada. Si no ingresas automaticamente, confirma tu email y luego inicia sesion.",
    };
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}
