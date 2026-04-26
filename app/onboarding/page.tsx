import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/forms/onboarding-form";
import { requireUser } from "@/lib/auth/session";
import { getActiveBusiness } from "@/lib/business/get-active-business";

export default async function OnboardingPage() {
  const user = await requireUser();
  const business = await getActiveBusiness(user.id);

  if (business) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl items-center px-4 py-10">
      <section className="w-full space-y-6 rounded-xl border bg-card p-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Configura tu negocio</h1>
          <p className="text-sm text-muted-foreground">
            Este paso se realiza una sola vez para activar tu panel.
          </p>
        </div>
        <OnboardingForm />
      </section>
    </main>
  );
}
