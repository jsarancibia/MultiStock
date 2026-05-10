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

export async function inviteMemberAction(formData: FormData) {
  const { business } = await requireBusinessRole(["owner"]);
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  if (!email) return { message: "Email requerido." };

  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email")
    .eq("email", email)
    .maybeSingle();

  if (!profile) {
    return { message: "El usuario no está registrado en MultiStock." };
  }

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

  revalidatePath("/equipo");
  return { success: true, message: "Empleado agregado correctamente." };
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
