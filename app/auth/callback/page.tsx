import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Props = {
  searchParams: Promise<{ code?: string; next?: string }>;
};

export default async function AuthCallbackPage({ searchParams }: Props) {
  const { code, next } = await searchParams;
  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      redirect(next ?? "/dashboard");
    }
  }

  const { data } = await supabase.auth.getUser();
  if (data.user) {
    redirect(next ?? "/dashboard");
  }

  redirect("/auth/login");
}
