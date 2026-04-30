import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/forms/register-form";
import { getCurrentUser } from "@/lib/auth/session";
import { getActiveBusiness } from "@/lib/business/get-active-business";

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) {
    const business = await getActiveBusiness(user.id);
    redirect(business ? "/dashboard" : "/onboarding");
  }

  return (
    <AuthShell
      mode="register"
      card={
        <AuthCard
          badge="Cuenta gratis"
          title="Crear cuenta"
          description="Configura tu negocio y accede al panel de MultiStock."
        >
          <RegisterForm />
        </AuthCard>
      }
    />
  );
}
