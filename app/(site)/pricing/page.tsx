import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Check, Info, Mail, X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { PLAN_DEFINITIONS } from "@/config/plans";
import { cn } from "@/lib/utils";
import { getCurrentProfile } from "@/lib/auth/is-admin";
import { gmailLink, SALES_EMAIL } from "@/lib/email-links";

export const metadata: Metadata = {
  title: "Precios",
  description: "Planes mensuales de MultiStock para negocios pequeños en Chile.",
};

const plans = [
  PLAN_DEFINITIONS.free,
  PLAN_DEFINITIONS.pro,
  PLAN_DEFINITIONS.super,
  PLAN_DEFINITIONS.enterprise,
] as const;

export default async function PricingPage() {
  // Si el usuario tiene sesión y no es admin, redirigir al dashboard
  const profile = await getCurrentProfile().catch(() => null);
  if (profile && profile.role !== "admin") {
    redirect("/dashboard");
  }
  return (
    <main className="py-14 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <header className="mb-8 text-center sm:mb-10">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Precios</h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Planes mensuales para controlar inventario y ventas sin sistemas rígidos.{" "}
            <strong className="font-medium text-foreground">Todo negocio nuevo parte en Gratis.</strong>
          </p>
        </header>

        <div
          className="mb-10 flex gap-2 rounded-2xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-100"
          role="status"
        >
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
          <p>
            MultiStock todavía no incluye facturación electrónica/DTE ni integración SII. Por eso los
            precios se enfocan en inventario, ventas simples y soporte cercano para almacenes,
            verdulerías y ferreterías.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={cn(
                "flex flex-col rounded-2xl border p-6 shadow-sm",
                plan.highlighted
                  ? "border-primary/40 bg-primary/[0.04] ring-1 ring-primary/20"
                  : "border-border/80 bg-card/50"
              )}
            >
              <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                {plan.name}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{plan.tag}</p>
              <p className="mt-4 text-3xl font-semibold tracking-tight">{plan.price}</p>
              <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>

              <ul className="mt-5 space-y-2.5 text-sm text-foreground/90">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                    {feature}
                  </li>
                ))}
              </ul>

              {plan.limitations?.length ? (
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  {plan.limitations.map((limitation) => (
                    <li key={limitation} className="flex gap-2">
                      <X className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                      {limitation}
                    </li>
                  ))}
                </ul>
              ) : null}

              <div className="mt-5 rounded-xl border border-border/80 bg-background/60 p-3 text-sm">
                <p className="font-medium">Soporte incluido</p>
                <ul className="mt-2 space-y-1.5 text-muted-foreground">
                  {plan.support.map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </div>

              {plan.id !== "free" && (
                <div className="mt-auto pt-4">
                  <a
                    href={gmailLink(
                      SALES_EMAIL,
                      `Quiero contratar MultiStock ${plan.name}`,
                      `Hola MultiStock,\n\nQuiero contratar el plan ${plan.name} de MultiStock.\n\nDatos del negocio:\n- Nombre del negocio:\n- Rubro: (almacén / verdulería / ferretería)\n- Ciudad:\n- Cantidad aproximada de productos:\n- Cantidad de trabajadores que usarán el sistema:\n\nDatos de contacto:\n- Nombre:\n- Teléfono/WhatsApp:\n- Correo:\n\nQuedo atento(a).`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      buttonVariants({ variant: plan.highlighted ? "default" : "outline" }),
                      "w-full gap-2"
                    )}
                  >
                    <Mail className="size-4" />
                    Contratar {plan.name}
                  </a>
                </div>
              )}
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-card/60 px-4 py-3 text-sm text-muted-foreground">
          <p>
            El cambio de plan se gestiona manualmente por ahora.{" "}
            <a
              href={gmailLink(
                SALES_EMAIL,
                "Quiero contratar MultiStock",
                "Hola MultiStock,\n\nQuiero contratar un plan de MultiStock.\n\nDatos del negocio:\n- Nombre del negocio:\n- Rubro: (almacén / verdulería / ferretería)\n- Ciudad:\n- Cantidad aproximada de productos:\n- Cantidad de trabajadores que usarán el sistema:\n\nDatos de contacto:\n- Nombre:\n- Teléfono/WhatsApp:\n- Correo:\n\nQuedo atento(a)."
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline"
            >
              Escríbenos a {SALES_EMAIL}
            </a>{" "}
            y te asignamos el plan que necesites. Mientras tanto, cada cuenta nueva queda asociada al
            plan Gratis.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link href="/auth/register" className={cn(buttonVariants({ size: "lg" }))}>
            Crear cuenta
          </Link>
          <Link href="/demo" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
            Ver demo
          </Link>
        </div>
      </div>
    </main>
  );
}
