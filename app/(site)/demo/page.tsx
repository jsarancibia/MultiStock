import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DashboardMockup } from "@/components/marketing/dashboard-mockup";
import {
  DemoAlertsMiniMock,
  DemoInventoryMiniMock,
  DemoSaleMiniMock,
} from "@/components/marketing/demo-mini-mocks";

export const metadata: Metadata = {
  title: "Demo",
  description:
    "Recorrido guiado por el panel MultiStock: resumen operativo, productos, nueva venta y alertas.",
};

const steps = [
  {
    title: "1. Panel de control",
    body: (
      <>
        Cuando inicias sesión, el primer vistazo muestra KPIs rápidos: productos activos, cuántos están en o bajo stock
        mínimo, ventas del día consolidadas por total y últimos movimientos de entrada o salida. La sección por rubro
        suma indicadores prácticos (por ejemplo verdulería vs. ferretería) sobre el mismo operativo sin cambiar la base
        de datos.
      </>
    ),
    content: "mockup" as const,
  },
  {
    title: "2. Productos e inventario operativo",
    body: (
      <>
        Creas o cargas rápido el catálogo con nombre, SKU o código cuando lo uses, proveedor opcional y unidades
        configurables por artículo. El inventario te muestra el stock actual contra el mínimo en una sola grilla para
        decidir reposición antes de llegar al mostrador sin stock.
      </>
    ),
    content: "inventory" as const,
  },
  {
    title: "3. Nueva venta en tiempo real",
    body: (
      <>
        Una venta se arma línea por línea: buscas productos activos, ajustas cantidad respetando reglas por unidad
        (decimal en kg donde corresponde), eliges medio de cobro confirmado por el equipo y ves el total al instante. Al
        confirmar se descuenta automáticamente el stock disponible sin pasos paralelos.
      </>
    ),
    content: "sale" as const,
  },
  {
    title: "4. Centro de alertas",
    body: (
      <>
        Alertas muestran qué elemento del catálogo requiere atención prioritaria: texto claro sobre el problema
        detectado — saldo bajo, aviso de vigencia cercana cuando el rubro lo habilitó u otros eventos del motor de
        reglas configurado para ese negocio.
      </>
    ),
    content: "alerts" as const,
  },
] as const;

export default function DemoPage() {
  return (
    <main className="py-14 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <header className="mb-10 space-y-3 sm:mb-14">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Demo guiada MultiStock</h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Sigue el recorrido de un equipo pequeño usando el día a día: desde el primer resumen al registro típico de una
            venta y el control de eventualidades mediante alertas orientadas por negocio. Las ilustraciones de esta página
            son composiciones tipo interfaz pensadas como referencia; puedes cambiarlas luego por capturas reales de tu
            comercio.
          </p>
        </header>

        <ol className="space-y-16 lg:space-y-20">
          {steps.map((step) => (
            <li key={step.title} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-center">
              <div className="space-y-3">
                <h2 className="text-xl font-semibold tracking-tight">{step.title}</h2>
                <div className="text-sm leading-relaxed text-muted-foreground sm:text-[0.9375rem]">{step.body}</div>
              </div>
              {step.content === "mockup" ? (
                <div className="relative">
                  <div className="absolute -inset-2 rounded-[1.375rem] bg-gradient-to-br from-primary/[0.2] via-transparent to-muted/50 opacity-80 blur-xl" />
                  <div className="relative">
                    <DashboardMockup />
                  </div>
                </div>
              ) : step.content === "inventory" ? (
                <DemoInventoryMiniMock />
              ) : step.content === "sale" ? (
                <DemoSaleMiniMock />
              ) : (
                <DemoAlertsMiniMock />
              )}
            </li>
          ))}
        </ol>

        <div className="mt-16 flex flex-col items-center justify-center gap-3 border-t border-border/60 pt-12 sm:flex-row">
          <Link href="/auth/register" className={cn(buttonVariants({ size: "lg" }), "shadow-md shadow-primary/25")}>
            Empieza gratis con una cuenta nueva
          </Link>
          <Link href="/features" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
            Ver listado técnico de funcionalidades
          </Link>
        </div>
      </div>
    </main>
  );
}
