import { cache } from "react";
import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";

export type CurrentProfile = {
  id: string;
  email: string | null;
  role: "admin" | "user";
  plan: "free" | "pro" | "business";
  created_at: string;
};

export const getCurrentProfile = cache(async (currentUser?: User): Promise<CurrentProfile | null> => {
  const user = currentUser ?? (await requireUser());
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id,email,role,plan,created_at")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data) return null;
  return data;
});

export function isAdminProfile(profile: Pick<CurrentProfile, "role"> | null | undefined) {
  return profile?.role === "admin";
}

export async function isAdmin(currentUser?: User) {
  const profile = await getCurrentProfile(currentUser);
  return isAdminProfile(profile);
}

export async function requireAdmin() {
  const allowed = await isAdmin();
  if (!allowed) {
    redirect("/");
  }
}
