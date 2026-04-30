import Link from "next/link";
import { redirect } from "next/navigation";
import { BarChart3, Bell, LineChart, Package, ShoppingCart } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { getActiveBusiness } from "@/lib/business/get-active-business";
import { buttonVariants } from "@/components/ui/button";
import { DashboardMockup } from "@/components/marketing/dashboard-mockup";
import { cn } from "@/lib/utils";

const benefits = [
  {
    title: "Inventario simple",
    description: "Productos, stock mínimo y unidades (incluida venta por peso en verdulería).",
    icon: Package,
  },
  {
    title: "Ventas en segundos",
    description: "Buscá, cargá líneas y confirmá. El descuento de stock y totales se calculan solos.",
    icon: ShoppingCart,
  },
  {
    title: "Alertas de stock",
    description: "Recibí avisos de bajo stock y perecibles según el rubro.",
    icon: Bell,
  },
  {
    title: "Panel por rubro",
    description: "Indicadores y campos que cambian con verdulería, almacén o ferretería.",
    icon: BarChart3,
  },
] as const;

export default async function HomePage() {
  const user = await getCurrentUser();

  if (user) {
    const business = await getActiveBusiness(user.id);
    redirect(business ? "/dashboard" : "/onboarding");
  }

  return (
    <main>
      <section className="border-b border-border/60 bg-gradient-to-b from-background via-muted/15 to-background">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-center">
            <div className="space-y-6">
              <p className="text-sm font-medium text-muted-foreground">
                Para verdulerías, almacenes y ferreterías
              </p>
              <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                Controlá stock, ventas y alertas sin complicarte.
              </h1>
              <p className="text-lg text-muted-foreground sm:text-xl">
                MultiStock concentra productos, movimientos, proveedores y ventas en un panel claro.
                Nada de hojas sueltas: todo conectado y listo para el día a día.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Link href="/auth/register" className={cn(buttonVariants({ size: "lg" }))}>
                  Crear cuenta
                </Link>
                <Link
                  href="/demo"
                  className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
                >
                  Ver demo
                </Link>
                <Link
                  href="/features"
                  className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  Ver funcionalidades
                </Link>
              </div>
            </div>
            <div className="order-first lg:order-none">
              <DashboardMockup />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20" aria-labelledby="beneficios-titulo">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10 text-center sm:mb-14">
            <h2
              id="beneficios-titulo"
              className="text-2xl font-semibold tracking-tight sm:text-3xl"
            >
              Todo lo esencial, sin ruido
            </h2>
            <p className="mt-2 text-muted-foreground">
              Pensado para equipos chicos que necesitan confianza y rapidez.
            </p>
          </div>
          <ul className="grid gap-6 sm:grid-cols-2">
            {benefits.map((item) => (
              <li
                key={item.title}
                className="rounded-2xl border border-border/80 bg-card/40 p-6 shadow-sm"
              >
                <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-primary/8 text-primary">
                  <item.icon className="size-5" aria-hidden />
                </div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-border/60 bg-muted/15 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          <LineChart
            className="mx-auto mb-4 size-10 text-muted-foreground/80"
            aria-hidden
          />
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Probá el flujo en la demo
          </h2>
          <p className="mt-2 max-w-xl mx-auto text-muted-foreground">
            Un recorrido visual de dashboard, productos, venta y alertas, sin crear cuenta todavía.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/demo" className={cn(buttonVariants({ size: "lg" }))}>
              Abrir demo
            </Link>
            <Link
              href="/auth/register"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Registrarme
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
