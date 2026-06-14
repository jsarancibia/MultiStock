"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { humanizeActionError } from "@/lib/errors/action-error";
import { linkPendingInvitationsForUser } from "@/lib/auth/link-pending-invitations";
import { createClient } from "@/lib/supabase/server";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  updatePasswordSchema,
  changePasswordSchema,
} from "@/lib/validations/auth";

export type AuthActionState = {
  message?: string;
  errors?: Record<string, string[]>;
  tone?: "error" | "success" | "info";
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
  const normalizedEmail = parsed.data.email.toLowerCase();

  const { error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password: parsed.data.password,
  });

  if (error) {
    return { message: "Credenciales invalidas o usuario no confirmado." };
  }

  // Verificar si tiene invitaciones pendientes → vincularlo automaticamente
  const { data: authUser } = await supabase.auth.getUser();
  await linkPendingInvitationsForUser({
    userId: authUser.user?.id,
    email: normalizedEmail,
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
  const normalizedEmail = parsed.data.email.toLowerCase();

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: normalizedEmail,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
    },
  });

  if (signUpError) {
    return { message: humanizeActionError(signUpError.message, "No se pudo crear la cuenta.") };
  }

  // Intentar auto-login para tener sesión activa antes de vincular invitaciones.
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password: parsed.data.password,
  });

  if (signInError) {
    // Si no puede iniciar sesión (ej: correo no confirmado),
    // intentamos vincular igual usando el userId del signUp (requiere service_role).
    await linkPendingInvitationsForUser({
      userId: signUpData.user?.id,
      email: normalizedEmail,
    });
    return {
      message:
        "Cuenta creada. Confirma tu email y luego inicia sesion para acceder al negocio.",
    };
  }

  // Sesión activa: vincular invitaciones pendientes con sesión completa.
  const { data: authUser } = await supabase.auth.getUser();
  await linkPendingInvitationsForUser({
    userId: authUser.user?.id ?? signUpData.user?.id,
    email: normalizedEmail,
  });

  redirect("/dashboard");
}

export async function resetPasswordAction(
  _prevState: AuthActionState | undefined,
  formData: FormData
): Promise<AuthActionState | undefined> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const normalizedEmail = parsed.data.email.toLowerCase();

  const head = await headers();
  const host = head.get("host");
  const protocol = host?.includes("localhost") ? "http" : "https";
  const origin = `${protocol}://${host}`;

  const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
    redirectTo: `${origin}/auth/callback?next=/auth/update-password`,
  });

  if (error) {
    return { message: humanizeActionError(error.message, "No se pudo enviar el correo de recuperacion.") };
  }

  return {
    message: "Si el email esta registrado, recibiras un enlace para restablecer tu contrasena.",
    tone: "success",
  };
}

export async function updatePasswordAction(
  _prevState: AuthActionState | undefined,
  formData: FormData
): Promise<AuthActionState | undefined> {
  const parsed = updatePasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    redirect("/auth/login");
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return { message: humanizeActionError(error.message, "No se pudo actualizar la contrasena.") };
  }

  redirect("/dashboard");
}

export async function changePasswordAction(
  _prevState: AuthActionState | undefined,
  formData: FormData
): Promise<AuthActionState | undefined> {
  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmNewPassword: formData.get("confirmNewPassword"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user?.email) {
    return { message: "No se pudo verificar tu sesion. Vuelve a iniciar sesion." };
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: userData.user.email,
    password: parsed.data.currentPassword,
  });

  if (signInError) {
    return {
      errors: { currentPassword: ["La contrasena actual es incorrecta."] },
    };
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: parsed.data.newPassword,
  });

  if (updateError) {
    return { message: humanizeActionError(updateError.message, "No se pudo actualizar la contrasena.") };
  }

  return {
    message: "Contrasena actualizada correctamente.",
    tone: "success",
  };
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}
