import { redirect } from "next/navigation";
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
    <main className="mx-auto flex min-h-dvh w-full max-w-md items-center px-4 py-10">
      <section className="w-full space-y-6 rounded-xl border bg-card p-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Crear cuenta</h1>
          <p className="text-sm text-muted-foreground">
            Registra tu usuario para configurar tu negocio.
          </p>
        </div>
        <RegisterForm />
      </section>
    </main>
  );
}
