import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/forms/login-form";
import { getCurrentUser } from "@/lib/auth/session";
import { getActiveBusiness } from "@/lib/business/get-active-business";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) {
    const business = await getActiveBusiness(user.id);
    redirect(business ? "/dashboard" : "/onboarding");
  }

  return (
    <AuthShell
      mode="login"
      card={
        <AuthCard
          title="Iniciar sesión"
          description="Continúa con tu negocio en MultiStock."
        >
          <LoginForm />
        </AuthCard>
      }
    />
  );
}
