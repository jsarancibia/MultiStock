"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireBusinessRole } from "@/lib/auth/require-business-role";

export type TeamMember = {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
  profiles: { full_name: string | null; email: string | null } | null;
};

export type PendingInvitation = {
  id: string;
  email: string;
  role: string;
  created_at: string;
};

export async function listTeamMembers() {
  const { business } = await requireBusinessRole(["owner"]);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("business_users")
    .select("id,user_id,role,created_at,profiles(full_name,email)")
    .eq("business_id", business.id)
    .order("created_at");

  if (error) return [];
  return (data ?? []) as TeamMember[];
}

export async function listPendingInvitations() {
  const { business } = await requireBusinessRole(["owner"]);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("pending_invitations")
    .select("id,email,role,created_at")
    .eq("business_id", business.id)
    .order("created_at");

  if (error) return [];
  return (data ?? []) as PendingInvitation[];
}

export async function inviteMemberAction(formData: FormData) {
  const { business, user } = await requireBusinessRole(["owner"]);
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  if (!email) return { message: "Email requerido." };

  const supabase = await createClient();

  // 1. Verificar si ya tiene cuenta
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email")
    .eq("email", email)
    .maybeSingle();

  if (profile) {
    // Tiene cuenta — crear vínculo directo
    const { data: existing } = await supabase
      .from("business_users")
      .select("id")
      .eq("business_id", business.id)
      .eq("user_id", profile.id)
      .maybeSingle();

    if (existing) {
      return { message: "El usuario ya es miembro de este negocio." };
    }

    const { error } = await supabase.from("business_users").insert({
      business_id: business.id,
      user_id: profile.id,
      role: "employee",
    });

    if (error) {
      return { message: "Error al agregar miembro. Intenta de nuevo." };
    }

    // Si tenía invitación pendiente, limpiarla
    await supabase
      .from("pending_invitations")
      .delete()
      .eq("business_id", business.id)
      .eq("email", email);

    revalidatePath("/equipo");
    return { success: true, message: "Empleado agregado correctamente." };
  }

  // 2. No tiene cuenta — guardar invitación pendiente
  const { data: inviteExists } = await supabase
    .from("pending_invitations")
    .select("id")
    .eq("business_id", business.id)
    .eq("email", email)
    .maybeSingle();

  if (inviteExists) {
    return { message: "Ya existe una invitación pendiente para este email." };
  }

  const { error: inviteError } = await supabase
    .from("pending_invitations")
    .insert({
      business_id: business.id,
      email,
      role: "employee",
      invited_by: user.id,
    });

  if (inviteError) {
    console.error("inviteMemberAction (pending_invitations):", inviteError.message);
    return { message: "Error al crear la invitación. Intenta de nuevo." };
  }

  revalidatePath("/equipo");
  return { success: true, message: "Invitación enviada correctamente." };
}

export async function cancelInvitationAction(invitationId: string) {
  const { business } = await requireBusinessRole(["owner"]);
  const supabase = await createClient();

  const { error } = await supabase
    .from("pending_invitations")
    .delete()
    .eq("id", invitationId)
    .eq("business_id", business.id);

  if (error) {
    return { message: "Error al cancelar la invitación." };
  }

  revalidatePath("/equipo");
  return { success: true, message: "Invitación cancelada." };
}

export async function removeMemberAction(userId: string) {
  const { business } = await requireBusinessRole(["owner"]);

  const supabase = await createClient();
  const { error } = await supabase
    .from("business_users")
    .delete()
    .eq("business_id", business.id)
    .eq("user_id", userId);

  if (error) {
    return { message: "Error al eliminar miembro." };
  }

  revalidatePath("/equipo");
  return { success: true, message: "Miembro eliminado correctamente." };
}
