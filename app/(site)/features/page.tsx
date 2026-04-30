import type { Metadata } from "next";
import {
  BarChart3,
  Bell,
  Box,
  LayoutDashboard,
  Store,
  Truck,
  Warehouse,
  Wrench,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Características",
  description:
    "Productos, inventario, movimientos, ventas, proveedores, alertas y panel por rubro.",
};

const featureBlocks = [
  {
    title: "Productos",
    description:
      "Alta, precios, categorías, proveedor y campos extra según almacén, ferretería o verdulería (marca, medida, perecibles, merma, etc.).",
    icon: Box,
  },
  {
    title: "Inventario",
    description:
      "Stock actual y mínimo en una vista, con acceso al historial por producto.",
    icon: Warehouse,
  },
  {
    title: "Movimientos",
    description:
      "Compras, ajustes, mermas, devoluciones y stock inicial con motivo y costo unitario opcional.",
    icon: BarChart3,
  },
  {
    title: "Ventas básicas",
    description:
      "Búsqueda de productos, carrito, cantidad con reglas por unidad, precio y método de pago.",
    icon: Store,
  },
  {
    title: "Proveedores",
    description: "Carga y edición de contactos para asignarlos a productos y filtros.",
    icon: Truck,
  },
  {
    title: "Alertas",
    description: "Listado de eventos: stock bajo, sin stock, perecibles y mermas, según corresponda.",
    icon: Bell,
  },
  {
    title: "Dashboard",
    description:
      "Métricas de productos activos, stock en alerta, ventas de hoy, movimientos y alertas pendientes.",
    icon: LayoutDashboard,
  },
  {
    title: "Personalización por rubro",
    description:
      "Indicadores y formularios que respetan verdulería, almacén o ferretería, sin módulos extra.",
    icon: Wrench,
  },
] as const;

export default function FeaturesPage() {
  return (
    <main className="py-14 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <header className="mb-10 max-w-2xl sm:mb-12">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Características</h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Esto es lo que MultiStock ofrece hoy: un núcleo operativo completo para comercios chicos, sin
            módulos de caja, facturación o multi-sucursal (aún).
          </p>
        </header>
        <ul className="grid gap-4 sm:grid-cols-2">
          {featureBlocks.map((f) => (
            <li
              key={f.title}
              className="flex gap-4 rounded-2xl border border-border/80 bg-card/50 p-5 shadow-sm"
            >
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/8 text-primary">
                <f.icon className="size-5" aria-hidden />
              </div>
              <div>
                <h2 className="font-semibold">{f.title}</h2>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                  {f.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
