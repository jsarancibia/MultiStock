import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Boxes,
  CheckCircle2,
  FileDown,
  Package,
  Scale,
  Search,
  ShieldCheck,
  ShoppingCart,
  Store,
  Truck,
  Wrench,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { getActiveBusiness } from "@/lib/business/get-active-business";
import { buttonVariants } from "@/components/ui/button";
import { DashboardMockup } from "@/components/marketing/dashboard-mockup";
import { HeroActions } from "@/components/marketing/hero-actions";
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
  "Inventario",
  "Ventas simples",
  "Proveedores",
  "Alertas",
  "Reportes",
  "Exportaciones CSV",
  "Auditoría",
] as const;

const upcoming = ["Caja simple", "Sucursales", "Roles avanzados", "Pagos SaaS", "App móvil"] as const;

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
      <section className="relative border-b border-border/60 bg-gradient-to-b from-background via-muted/15 to-background">
        <div className="pointer-events-none absolute left-[-12rem] top-12 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute right-[-14rem] top-28 h-96 w-96 rounded-full bg-amber-900/15 blur-3xl" />
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-center">
            <div className="space-y-6">
              <span className="inline-flex w-fit rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                Para verdulerías, almacenes y ferreterías
              </span>
              <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                Controla stock, ventas y alertas sin complicarte.
              </h1>
              <p className="text-lg text-muted-foreground sm:text-xl">
                MultiStock ordena productos, inventario, proveedores, movimientos y ventas en un solo panel.
                Ideal para comercios chicos que necesitan claridad sin software pesado.
              </p>
              <HeroActions />
            </div>
            <div className="relative order-first lg:order-none">
              <div className="absolute -inset-2 rounded-[1.375rem] bg-gradient-to-br from-primary/20 via-transparent to-muted/50 blur-xl" />
              <div className="relative">
              <DashboardMockup />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border/60 py-16 sm:py-20" aria-labelledby="problemas-titulo">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10 max-w-2xl">
            <h2 id="problemas-titulo" className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Deja de controlar tu negocio con hojas sueltas
            </h2>
            <p className="mt-3 text-muted-foreground">
              MultiStock conecta las tareas del día: lo que cargas en productos impacta en inventario, ventas,
              alertas y reportes.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {problems.map((item) => (
              <article key={item.title} className="rounded-2xl border border-border/80 bg-card/45 p-5">
                <item.icon className="mb-4 size-6 text-primary" aria-hidden />
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

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
          <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            {steps.map((step, index) => (
              <li key={step} className="rounded-2xl border border-border/80 bg-card/45 p-4">
                <span className="mb-3 flex size-8 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                  {index + 1}
                </span>
                <p className="text-sm font-medium">{step}</p>
              </li>
            ))}
          </ol>
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
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-y border-border/60 bg-muted/10 py-16 sm:py-20" aria-labelledby="rubros-titulo">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10 max-w-2xl">
            <h2 id="rubros-titulo" className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Una misma plataforma, adaptada al rubro
            </h2>
            <p className="mt-3 text-muted-foreground">
              Las “fotos” de producto muestran cómo se siente cada negocio: fresco, almacén de rotación y catálogo técnico.
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {businessScenes.map((scene) => (
              <ProductSceneCard key={scene.title} scene={scene} />
            ))}
          </div>
        </div>
      </section>

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
              <article key={module.title} className="rounded-2xl border border-border/80 bg-card/45 p-5">
                <module.icon className="mb-4 size-6 text-primary" aria-hidden />
                <h3 className="font-semibold">{module.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{module.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border/60 bg-muted/10 py-16 sm:py-20" aria-labelledby="incluye-titulo">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-2">
          <div>
            <h2 id="incluye-titulo" className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Claro desde el inicio
            </h2>
            <p className="mt-3 text-muted-foreground">
              La versión actual se enfoca en inventario, ventas simples y visibilidad operativa. Lo avanzado queda para
              fases posteriores.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <article className="rounded-2xl border border-primary/25 bg-primary/5 p-5">
              <h3 className="mb-4 flex items-center gap-2 font-semibold">
                <CheckCircle2 className="size-5 text-primary" aria-hidden />
                Incluye hoy
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {included.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
            <article className="rounded-2xl border border-border/80 bg-card/45 p-5">
              <h3 className="mb-4 flex items-center gap-2 font-semibold">
                <ShieldCheck className="size-5 text-muted-foreground" aria-hidden />
                Próximamente
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {upcoming.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Empieza a ordenar tu stock hoy
          </h2>
          <p className="mt-2 max-w-xl mx-auto text-muted-foreground">
            Prueba el flujo completo: cuenta, negocio, rubro, productos, inventario, ventas, alertas y dashboard.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/auth/register" className={cn(buttonVariants({ size: "lg" }), "shadow-md shadow-primary/25")}>
              Crear cuenta gratis
            </Link>
            <Link
              href="/demo"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Ver demo guiada
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
