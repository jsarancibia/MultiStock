import type { Metadata } from "next";
import Link from "next/link";
import { Check, Info } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Precios",
  description: "Planes orientativos. El cobro in-app aún no está activo.",
};

const plans = [
  {
    name: "Starter",
    tag: "Un negocio chico",
    price: "Gratis*",
    detail: "Alta, inventario, ventas y alertas básicas.",
    highlights: [
      "Un comercio / espacio de trabajo",
      "Productos, stock e inventario",
      "Movimientos y ventas",
      "Panel y alertas",
    ],
    emphasized: false,
  },
  {
    name: "Pro",
    tag: "Comercio en crecimiento",
    price: "Próximamente",
    detail: "Límites amplios y mejores reportes (roadmap).",
    highlights: [
      "Más historial y exportaciones",
      "Funciones de equipo y roles (futuro)",
      "Soporte preferencial (futuro)",
    ],
    emphasized: true,
  },
  {
    name: "Business",
    tag: "Varios usuarios o sucursales (futuro)",
    price: "A definir",
    detail: "Pensado para cuándo MultiStock sume multi-sucursal real.",
    highlights: [
      "Varios perfiles o locales",
      "Operación coordinada (roadmap)",
      "Contacto comercial (roadmap)",
    ],
    emphasized: false,
  },
] as const;

export default function PricingPage() {
  return (
    <main className="py-14 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <header className="mb-8 text-center sm:mb-10">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Precios</h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Propuesta orientativa para validar con usuarios.{" "}
            <strong className="font-medium text-foreground">No hay checkout ni suscripción en la app aún.</strong>
          </p>
        </header>

        <div
          className="mb-10 flex gap-2 rounded-2xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-100"
          role="status"
        >
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
          <p>
            Los importes o límites definitivos se definirán más adelante. Hoy el foco es uso real del
            producto y feedback: registrá una cuenta y probá el panel sin costo in-app.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={cn(
                "flex flex-col rounded-2xl border p-6 shadow-sm",
                plan.emphasized
                  ? "border-primary/40 bg-primary/[0.04] ring-1 ring-primary/20"
                  : "border-border/80 bg-card/50"
              )}
            >
              <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                {plan.name}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{plan.tag}</p>
              <p className="mt-4 text-3xl font-semibold tracking-tight">{plan.price}</p>
              <p className="mt-1 text-sm text-muted-foreground">{plan.detail}</p>
              <ul className="mt-6 space-y-2.5 text-sm text-foreground/90">
                {plan.highlights.map((h) => (
                  <li key={h} className="flex gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                    {h}
                  </li>
                ))}
              </ul>
              {plan.name === "Starter" ? (
                <p className="mt-3 text-xs text-muted-foreground">* Gratis mientras dure la fase de validación del producto.</p>
              ) : null}
            </article>
          ))}
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
