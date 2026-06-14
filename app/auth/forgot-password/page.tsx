import { redirect } from "next/navigation";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/forms/forgot-password-form";
import { getCurrentUser } from "@/lib/auth/session";

export default async function ForgotPasswordPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <AuthShell
      mode="login"
      card={
        <AuthCard
          title="Recuperar contrasena"
          description="Ingresa tu email y te enviaremos un enlace para restablecerla."
        >
          <ForgotPasswordForm />

          <p className="mt-4 text-center text-sm text-muted-foreground">
            <Link href="/auth/login" className="font-medium text-primary hover:underline">
              Volver al inicio de sesion
            </Link>
          </p>
        </AuthCard>
      }
    />
  );
}
