import { redirect } from "next/navigation";
import { BrandLogo } from "@/components/brand/brand-logo";
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
    <main className="mx-auto flex min-h-dvh w-full max-w-4xl flex-col items-center justify-center px-4 py-10">
      <div className="mb-6 flex items-center gap-3">
        <BrandLogo
          className="h-16 w-24 rounded-xl"
          fit="contain"
          priority
          sizes="96px"
        />
        <span className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
          MultiStock
        </span>
      </div>
      <section className="grid w-full gap-6 rounded-2xl border bg-card p-6 shadow-sm md:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">Configura tu negocio</h1>
            <p className="text-sm text-muted-foreground">
              Este paso se realiza una sola vez para activar tu panel.
            </p>
          </div>
          <div className="rounded-xl border bg-muted/30 p-4">
            <p className="text-sm font-medium">Primer recorrido sugerido</p>
            <ol className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li>1. Crear negocio y elegir rubro</li>
              <li>2. Crear 3 productos</li>
              <li>3. Registrar stock inicial</li>
              <li>4. Hacer primera venta</li>
              <li>5. Revisar dashboard y alertas</li>
            </ol>
          </div>
          <div className="rounded-xl border bg-muted/30 p-4">
            <p className="text-sm font-medium">Checklist inicial</p>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li>- Crear primer producto</li>
              <li>- Crear primera categoría</li>
              <li>- Registrar movimiento de stock</li>
              <li>- Confirmar primera venta</li>
              <li>- Revisar alertas pendientes</li>
            </ul>
          </div>
        </div>
        <div className="space-y-4">
          <p className="text-sm font-medium">Paso 1 de 1: datos básicos del negocio</p>
          <OnboardingForm />
        </div>
      </section>
    </main>
  );
}
