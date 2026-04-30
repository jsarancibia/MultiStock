import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import fullLogo from "@/assets/logo-system/responsive/full-logo-light.png";
import { DashboardMockup } from "@/components/marketing/dashboard-mockup";

export const metadata: Metadata = {
  title: "Demo",
  description: "Recorrido visual del panel, productos, ventas y alertas.",
};

const steps = [
  {
    title: "1. Panel",
    body: "KPIs de productos, stock bajo, ventas de hoy y movimientos recientes, con sección por rubro.",
    content: "mockup" as const,
  },
  {
    title: "2. Productos e inventario",
    body: "Ficha de producto, filtros, stock actual y mínimo; el inventario resume todo en una tabla con accesos a movimientos.",
    content: "image" as const,
  },
  {
    title: "3. Nueva venta",
    body: "Buscás, agregás al carrito, ajustás cantidad y precio, elegís el método de pago y confirmás. El total se recalcula al instante.",
    content: "placeholder" as const,
    placeholderLabel: "Pantalla de nueva venta (búsqueda + carrito)",
  },
  {
    title: "4. Alertas",
    body: "Listado con tipo de evento, producto, mensaje y si está resuelta. Pensado para el día a día del depósito o mostrador.",
    content: "placeholder" as const,
    placeholderLabel: "Pantalla de alertas",
  },
] as const;

function ScreenPlaceholder({ label }: { label: string }) {
  return (
    <div className="flex aspect-[16/10] w-full items-center justify-center rounded-xl border border-dashed border-border/90 bg-gradient-to-b from-muted/30 to-muted/60 p-4">
      <p className="text-center text-sm font-medium text-muted-foreground">
        {label}
        <br />
        <span className="text-xs font-normal">Placeholder — podés reemplazar por capturas reales</span>
      </p>
    </div>
  );
}

export default function DemoPage() {
  return (
    <main className="py-14 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <header className="mb-10 max-w-2xl sm:mb-12">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Demo</h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Flujo sugerido de uso: desde el resumen, pasando por carga o consulta de producto, la venta y el control de
            alertas. Las imágenes son maquetas: podés sustituirlas por capturas de tu propio comercio.
          </p>
        </header>

        <ol className="space-y-14">
          {steps.map((step) => (
            <li key={step.title} className="grid gap-6 lg:grid-cols-2 lg:items-center">
              <div>
                <h2 className="text-xl font-semibold">{step.title}</h2>
                <p className="mt-2 text-muted-foreground leading-relaxed">{step.body}</p>
              </div>
              {step.content === "mockup" ? (
                <DashboardMockup />
              ) : step.content === "image" ? (
                <div className="rounded-2xl border border-border/80 bg-white p-6 shadow-sm">
                  <Image
                    src={fullLogo}
                    alt="Marca MultiStock (placeholder de sección de producto)"
                    className="h-auto w-full max-w-sm mx-auto object-contain"
                  />
                </div>
              ) : (
                <ScreenPlaceholder
                  label={"placeholderLabel" in step ? step.placeholderLabel : "Vista del módulo"}
                />
              )}
            </li>
          ))}
        </ol>

        <div className="mt-14 flex flex-col items-center justify-center gap-3 border-t border-border/60 pt-10 sm:flex-row">
          <Link href="/auth/register" className={cn(buttonVariants({ size: "lg" }))}>
            Empezar gratis
          </Link>
          <Link href="/features" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
            Ver listado de funcionalidades
          </Link>
        </div>
      </div>
    </main>
  );
}
