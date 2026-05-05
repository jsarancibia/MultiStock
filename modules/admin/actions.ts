"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/is-admin";
import { humanizeActionError } from "@/lib/errors/action-error";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  adminPlanSchema,
  adminRoleSchema,
  updateUserPlanSchema,
  updateUserRoleSchema,
} from "@/lib/validations/admin";

export type AdminActionState = {
  message?: string;
};

export async function getUsers() {
  await requireAdmin();
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id,email,role,plan,created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("No se pudieron cargar los usuarios.");
  }

  return data ?? [];
}

export async function getBusinesses() {
  await requireAdmin();
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("businesses")
    .select("id,name,business_type,subscription_plan,owner_id,created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("No se pudieron cargar los negocios.");
  }

  const ownerIds = [...new Set((data ?? []).map((row) => row.owner_id))];
  if (ownerIds.length === 0) return [];

  const { data: owners } = await supabase
    .from("profiles")
    .select("id,email")
    .in("id", ownerIds);

  const ownerById = new Map((owners ?? []).map((owner) => [owner.id, owner.email]));
  return (data ?? []).map((business) => ({
    ...business,
    owner_email: ownerById.get(business.owner_id) ?? null,
  }));
}

export async function getAdminDashboard() {
  await requireAdmin();
  const supabase = createAdminClient();

  const [{ count: totalUsers }, { count: totalBusinesses }, { data: recentUsers }, { data: planRows }] =
    await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("businesses").select("id", { count: "exact", head: true }),
      supabase
        .from("profiles")
        .select("id,email,role,plan,created_at")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase.from("profiles").select("plan"),
    ]);

  const usersByPlan = { free: 0, pro: 0, business: 0 };
  for (const row of planRows ?? []) {
    const plan = adminPlanSchema.safeParse(row.plan);
    if (plan.success) {
      usersByPlan[plan.data] += 1;
    }
  }

  return {
    totalUsers: totalUsers ?? 0,
    totalBusinesses: totalBusinesses ?? 0,
    usersByPlan,
    recentUsers: recentUsers ?? [],
  };
}

export async function updateUserPlan(userId: string, plan: string) {
  await requireAdmin();
  const parsed = updateUserPlanSchema.parse({ userId, plan });
  const supabase = createAdminClient();

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ plan: parsed.plan })
    .eq("id", parsed.userId);

  if (profileError) {
    throw new Error("No se pudo actualizar el plan del usuario.");
  }

  const { error: businessError } = await supabase
    .from("businesses")
    .update({ subscription_plan: parsed.plan })
    .eq("owner_id", parsed.userId);

  if (businessError) {
    throw new Error("El usuario cambió de plan pero no se sincronizaron sus negocios.");
  }

  revalidatePath("/admin");
  revalidatePath("/admin/users");
  revalidatePath("/admin/businesses");
}

export async function updateUserRole(userId: string, role: string) {
  await requireAdmin();
  const parsed = updateUserRoleSchema.parse({ userId, role });
  const supabase = createAdminClient();

  if (parsed.role === "user") {
    const [{ count: adminsCount }, { data: current }] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "admin"),
      supabase.from("profiles").select("id,role").eq("id", parsed.userId).maybeSingle(),
    ]);

    if ((adminsCount ?? 0) <= 1 && current?.role === "admin") {
      throw new Error("Debe existir al menos un administrador en el sistema.");
    }
  }

  const { error } = await supabase
    .from("profiles")
    .update({ role: parsed.role })
    .eq("id", parsed.userId);

  if (error) {
    throw new Error("No se pudo actualizar el rol del usuario.");
  }

  revalidatePath("/admin");
  revalidatePath("/admin/users");
}

export async function updateUserPlanAction(
  _state: AdminActionState | undefined,
  formData: FormData
): Promise<AdminActionState> {
  try {
    await updateUserPlan(String(formData.get("userId") ?? ""), String(formData.get("plan") ?? ""));
    return { message: "Plan actualizado." };
  } catch (error) {
    return { message: humanizeActionError(error, "No se pudo actualizar el plan.") };
  }
}

export async function updateUserRoleAction(
  _state: AdminActionState | undefined,
  formData: FormData
): Promise<AdminActionState> {
  try {
    await updateUserRole(String(formData.get("userId") ?? ""), String(formData.get("role") ?? ""));
    return { message: "Rol actualizado." };
  } catch (error) {
    return { message: humanizeActionError(error, "No se pudo actualizar el rol.") };
  }
}

export async function parseAdminRole(value: string) {
  return adminRoleSchema.parse(value);
}
