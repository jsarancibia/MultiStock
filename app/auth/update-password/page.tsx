import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthShell } from "@/components/auth/auth-shell";
import { UpdatePasswordForm } from "@/components/forms/update-password-form";
import { getCurrentUser } from "@/lib/auth/session";

export default async function UpdatePasswordPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/login");
  }

  return (
    <AuthShell
      mode="login"
      card={
        <AuthCard
          title="Nueva contrasena"
          description="Elige una contrasena segura para tu cuenta."
        >
          <UpdatePasswordForm />
        </AuthCard>
      }
    />
  );
}
