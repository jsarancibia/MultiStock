import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bell,
  Boxes,
  CheckCircle2,
  Clock,
  FileDown,
  Package,
  Scale,
  Search,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Store,
  Truck,
  Wrench,
  Zap,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { getActiveBusiness } from "@/lib/business/get-active-business";
import { buttonVariants } from "@/components/ui/button";
import { DashboardMockup } from "@/components/marketing/dashboard-mockup";
import { HeroActions } from "@/components/marketing/hero-actions";
import { SectionReveal } from "@/components/marketing/section-reveal";
import { cn } from "@/lib/utils";

const benefits = [
  {
    title: "Inventario simple",
    description: "Productos, stock mínimo y unidades (incluida venta por peso en verdulería).",
    icon: Package,
  },
  {
    title: "Ventas en segundos",
    description: "Busca productos, arma líneas y confirma. El descuento de stock y totales se calculan solos.",
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

const problems = [
  {
    title: "Stock desordenado",
    description: "Productos anotados en papel, planillas distintas y cantidades que no coinciden.",
    icon: Boxes,
  },
  {
    title: "Ventas sin trazabilidad",
    description: "Se vende, pero después cuesta saber qué producto movió stock y cuándo.",
    icon: ShoppingCart,
  },
  {
    title: "Reposición tarde",
    description: "El aviso llega cuando ya falta mercadería en góndola o depósito.",
    icon: AlertTriangle,
  },
  {
    title: "Información dispersa",
    description: "Proveedores, precios, mínimos y movimientos viven en lugares separados.",
    icon: Search,
  },
] as const;

const steps = [
  "Crea tu cuenta",
  "Configura el negocio",
  "Elige rubro",
  "Carga productos",
  "Registra ventas",
  "Revisa alertas",
] as const;

const modules = [
  {
    title: "Productos",
    description: "Catálogo con precios, SKU, código de barras, proveedor, categoría y campos por rubro.",
    icon: Package,
  },
  {
    title: "Inventario",
    description: "Stock actual, mínimo y señales rápidas para saber qué revisar primero.",
    icon: Boxes,
  },
  {
    title: "Ventas",
    description: "Carrito simple con descuento automático de stock al confirmar.",
    icon: ShoppingCart,
  },
  {
    title: "Proveedores",
    description: "Contactos comerciales vinculados a productos para reponer más rápido.",
    icon: Truck,
  },
  {
    title: "Alertas",
    description: "Bajo stock, perecibles y eventos operativos visibles desde el panel.",
    icon: Bell,
  },
  {
    title: "Reportes y CSV",
    description: "Ventas por día, productos más vendidos y exportaciones de datos clave.",
    icon: FileDown,
  },
] as const;

const businessScenes = [
  {
    title: "Verdulería",
    description: "Peso, perecibles y merma para productos frescos.",
    icon: Scale,
    tags: ["kg", "perecibles", "merma"],
    gradient: "from-emerald-500/25 via-lime-500/10 to-orange-500/20",
    products: ["Manzana", "Tomate", "Banana", "Lechuga"],
  },
  {
    title: "Almacén",
    description: "Rotación rápida, códigos y control de góndola.",
    icon: Store,
    tags: ["SKU", "margen", "rotación"],
    gradient: "from-amber-500/25 via-orange-500/10 to-primary/15",
    products: ["Arroz", "Aceite", "Yerba", "Leche"],
  },
  {
    title: "Ferretería",
    description: "Marca, modelo, medida y datos técnicos.",
    icon: Wrench,
    tags: ["marca", "medida", "técnico"],
    gradient: "from-sky-500/25 via-primary/10 to-zinc-500/20",
    products: ["Tornillos", "Cable", "Pintura", "Llave"],
  },
] as const;

const included = [
  { label: "Inventario", icon: CheckCircle2 },
  { label: "Ventas simples", icon: CheckCircle2 },
  { label: "Proveedores", icon: CheckCircle2 },
  { label: "Alertas", icon: CheckCircle2 },
  { label: "Reportes", icon: CheckCircle2 },
  { label: "Exportaciones CSV", icon: CheckCircle2 },
  { label: "Auditoría", icon: CheckCircle2 },
] as const;

const upcoming = [
  { label: "Caja simple", icon: Clock },
  { label: "Sucursales", icon: Clock },
  { label: "Roles avanzados", icon: Clock },
  { label: "Pagos SaaS", icon: Clock },
  { label: "App móvil", icon: Clock },
] as const;

const stats = [
  { value: "<5 min", label: "Configuración", icon: Zap },
  { value: "$0", label: "Para empezar", icon: Sparkles },
  { value: "3 rubros", label: "Adaptable", icon: Store },
  { value: "Español", label: "Soporte", icon: ShieldCheck },
] as const;

function ProductSceneCard({ scene }: { scene: (typeof businessScenes)[number] }) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-border/80 bg-card/45 shadow-sm transition hover:border-primary/35 hover:shadow-xl hover:shadow-black/10">
      <div className={`relative min-h-52 bg-gradient-to-br ${scene.gradient} p-5`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,0.18),transparent_32%),radial-gradient(circle_at_80%_75%,rgba(255,255,255,0.08),transparent_30%)]" />
        <div className="relative flex h-full flex-col justify-between gap-10">
          <div className="flex items-center justify-between">
            <div className="flex size-12 items-center justify-center rounded-2xl border border-white/10 bg-background/55 text-primary shadow-lg backdrop-blur">
              <scene.icon className="size-6" aria-hidden />
            </div>
            <span className="rounded-full border border-white/10 bg-background/45 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
              {scene.title}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {scene.products.map((product) => (
              <div
                key={product}
                className="rounded-xl border border-white/10 bg-background/55 px-3 py-2 text-xs font-medium shadow-sm backdrop-blur"
              >
                {product}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="space-y-3 p-5">
        <h3 className="text-lg font-semibold">{scene.title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{scene.description}</p>
        <div className="flex flex-wrap gap-2">
          {scene.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

export default async function HomePage() {
  const user = await getCurrentUser();

  if (user) {
    const business = await getActiveBusiness(user.id);
    redirect(business ? "/dashboard" : "/onboarding");
  }

  return (
    <main className="overflow-hidden">
      <section className="relative border-b border-border/60 bg-gradient-to-b from-primary/5 via-muted/15 to-background">
        <div className="pointer-events-none absolute left-[-10rem] top-0 h-[28rem] w-[28rem] rounded-full bg-primary/15 blur-3xl" />
        <div className="pointer-events-none absolute right-[-14rem] top-24 h-[28rem] w-[28rem] rounded-full bg-amber-900/15 blur-3xl" />
        <div className="pointer-events-none absolute left-[40%] top-60 h-[20rem] w-[20rem] rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-center">
            <div className="space-y-7">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
                <Store className="size-3.5" aria-hidden />
                Para verdulerías, almacenes y ferreterías
              </span>
              <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                Controla stock, ventas y alertas{" "}
                <span className="gradient-text bg-gradient-to-r from-primary via-emerald-400 to-green-500">
                  sin complicarte.
                </span>
              </h1>
              <p className="max-w-lg text-lg leading-relaxed text-muted-foreground sm:text-xl">
                MultiStock ordena productos, inventario, proveedores, movimientos y
                ventas en un solo panel. Ideal para comercios chicos que necesitan
                claridad sin software pesado.
              </p>
              <HeroActions />
            </div>
            <div className="relative order-first lg:order-none">
              <DashboardMockup />
            </div>
          </div>
        </div>
      </section>

      <SectionReveal>
        <section className="border-b border-border/60 bg-muted/5 py-8 sm:py-10" aria-label="Estadísticas de confianza">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              {stats.map(({ value, label, icon: Icon }) => (
                <div key={label} className="flex flex-col items-center gap-2 text-center">
                  <Icon className="size-5 text-primary" aria-hidden />
                  <span className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {value}
                  </span>
                  <span className="text-sm text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </SectionReveal>

      <SectionReveal delay={100}>
        <section className="border-b border-border/60 py-16 sm:py-20" aria-labelledby="problemas-titulo">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mb-10 max-w-2xl">
              <h2 id="problemas-titulo" className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Deja de controlar tu negocio con hojas sueltas
              </h2>
              <p className="mt-3 text-muted-foreground">
                MultiStock conecta las tareas del día: lo que cargas en productos impacta en inventario, ventas, alertas y reportes.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {problems.map((item) => (
                <article
                  key={item.title}
                  className="group rounded-2xl border border-border/80 bg-card/45 p-5 transition hover:border-primary/35 hover:bg-card/65 hover:shadow-md"
                >
                  <div className="mb-4 flex size-9 items-center justify-center rounded-lg bg-red-500/10">
                    <item.icon className="size-5 text-red-500/70" aria-hidden />
                  </div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </SectionReveal>

      <SectionReveal delay={100}>
        <section className="border-b border-border/60 bg-muted/10 py-16 sm:py-20" aria-labelledby="funciona-titulo">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mb-10 text-center">
              <h2 id="funciona-titulo" className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Del registro al control real del stock
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
                El flujo está pensado para entrar rápido en operación, sin configuraciones largas antes de vender.
              </p>
            </div>
            <ol className="flex flex-col gap-2 sm:flex-row sm:gap-0">
              {steps.map((step, index) => (
                <li key={step} className="flex flex-1 items-center gap-3 sm:flex-col sm:gap-0">
                  <div className="flex flex-1 items-center gap-3 rounded-2xl border border-border/80 bg-card/45 p-4 transition hover:border-primary/35 hover:bg-card/65 hover:shadow-md sm:flex-col sm:text-center sm:p-5">
                    <span className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-sm font-bold text-primary ring-1 ring-primary/25">
                      {index + 1}
                    </span>
                    <p className="text-sm font-medium sm:mt-3">{step}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <ArrowRight className="mx-1 hidden size-5 shrink-0 text-primary/30 sm:block" aria-hidden />
                  )}
                </li>
              ))}
            </ol>
          </div>
        </section>
      </SectionReveal>

      <SectionReveal delay={100}>
        <section className="py-16 sm:py-20" aria-labelledby="beneficios-titulo">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mb-10 text-center sm:mb-14">
              <h2 id="beneficios-titulo" className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Todo lo esencial, sin ruido
              </h2>
              <p className="mt-2 text-muted-foreground">
                Lo necesario para operar ventas, inventario y reposición sin agregar pasos innecesarios.
              </p>
            </div>
            <ul className="grid gap-6 sm:grid-cols-2">
              {benefits.map((item) => (
                <li
                  key={item.title}
                  className="rounded-2xl border border-border/90 bg-card/45 p-6 shadow-sm transition hover:border-primary/35 hover:bg-card/65 hover:shadow-md"
                >
                  <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    <item.icon className="size-5" aria-hidden />
                  </div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </SectionReveal>

      <SectionReveal delay={100}>
        <section className="border-y border-border/60 bg-muted/10 py-16 sm:py-20" aria-labelledby="rubros-titulo">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mb-10 max-w-2xl">
              <h2 id="rubros-titulo" className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Una misma plataforma, adaptada al rubro
              </h2>
              <p className="mt-3 text-muted-foreground">
                Las &ldquo;fotos&rdquo; de producto muestran cómo se siente cada negocio: fresco, almacén de rotación y catálogo técnico.
              </p>
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              {businessScenes.map((scene) => (
                <ProductSceneCard key={scene.title} scene={scene} />
              ))}
            </div>
          </div>
        </section>
      </SectionReveal>

      <SectionReveal delay={100}>
        <section className="py-16 sm:py-20" aria-labelledby="modulos-titulo">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mb-10 text-center">
              <h2 id="modulos-titulo" className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Módulos listos para el día a día
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
                Todo consulta el negocio activo y mantiene la información separada por comercio.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {modules.map((module) => (
                <article
                  key={module.title}
                  className="group rounded-2xl border border-border/80 bg-card/45 p-5 transition hover:border-primary/35 hover:bg-card/65 hover:shadow-md"
                >
                  <div className="mb-4 flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary transition group-hover:bg-primary/25">
                    <module.icon className="size-5" aria-hidden />
                  </div>
                  <h3 className="font-semibold">{module.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{module.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </SectionReveal>

      <SectionReveal delay={100}>
        <section className="border-y border-border/60 bg-muted/10 py-16 sm:py-20" aria-labelledby="incluye-titulo">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-2">
            <div>
              <h2 id="incluye-titulo" className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Claro desde el inicio
              </h2>
              <p className="mt-3 text-muted-foreground">
                La versión actual se enfoca en inventario, ventas simples y visibilidad operativa. Lo avanzado queda para fases posteriores.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <article className="rounded-2xl border border-primary/25 bg-primary/5 p-6">
                <h3 className="mb-4 flex items-center gap-2 text-base font-semibold">
                  <CheckCircle2 className="size-5 text-primary" aria-hidden />
                  Incluye hoy
                </h3>
                <ul className="space-y-3">
                  {included.map(({ label, icon: Icon }) => (
                    <li key={label} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                      <Icon className="size-4 shrink-0 text-primary/70" aria-hidden />
                      {label}
                    </li>
                  ))}
                </ul>
              </article>
              <article className="rounded-2xl border border-border/80 bg-card/45 p-6">
                <h3 className="mb-4 flex items-center gap-2 text-base font-semibold">
                  <Clock className="size-5 text-muted-foreground" aria-hidden />
                  Próximamente
                </h3>
                <ul className="space-y-3">
                  {upcoming.map(({ label, icon: Icon }) => (
                    <li key={label} className="flex items-center gap-2.5 text-sm text-muted-foreground/70">
                      <Icon className="size-4 shrink-0" aria-hidden />
                      {label}
                    </li>
                  ))}
                </ul>
              </article>
            </div>
          </div>
        </section>
      </SectionReveal>

      <SectionReveal delay={100}>
        <section className="relative bg-gradient-to-b from-primary/5 via-primary/10 to-background py-20 sm:py-24">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_80%,rgba(56,210,140,0.12),transparent_60%)]" />
          <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Empieza a ordenar tu stock hoy
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Prueba el flujo completo: cuenta, negocio, rubro, productos, inventario, ventas, alertas y dashboard.
            </p>
            <p className="mt-2 text-sm font-medium text-primary">Sin compromiso. Cancelá cuando quieras.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <Link
                href="/auth/register"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "min-h-12 px-8 text-[1rem] font-semibold shadow-lg shadow-primary/30 transition hover:shadow-xl hover:shadow-primary/40"
                )}
              >
                Crear cuenta gratis
                <ArrowRight className="ml-2 size-4" aria-hidden />
              </Link>
              <Link
                href="/demo"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "min-h-12 px-6 text-[1rem] font-medium"
                )}
              >
                Ver demo guiada
              </Link>
            </div>
          </div>
        </section>
      </SectionReveal>
    </main>
  );
}
