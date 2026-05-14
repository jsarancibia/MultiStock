"use server";

import { redirect } from "next/navigation";
import { humanizeActionError } from "@/lib/errors/action-error";
import { linkPendingInvitationsForUser } from "@/lib/auth/link-pending-invitations";
import { createClient } from "@/lib/supabase/server";
import { loginSchema, registerSchema } from "@/lib/validations/auth";

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
  const { data: authUser } = await supabase.auth.getUser();
  await linkPendingInvitationsForUser({
    userId: authUser.user?.id,
    email: parsed.data.email,
  });

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
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
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
  await linkPendingInvitationsForUser({
    userId: signUpData.user?.id,
    email: parsed.data.email,
  });

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
