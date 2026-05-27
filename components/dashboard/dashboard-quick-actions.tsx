import { Bell, Move } from "lucide-react";
import { ActionCard } from "@/components/ui/action-card";

const actions = [
  {
    href: "/inventario/movimientos/nuevo",
    label: "Registrar movimiento",
    sub: "Compra, ajuste o merma",
    icon: Move,
  },
  {
    href: "/alertas",
    label: "Ver alertas",
    sub: "Stock y avisos",
    icon: Bell,
  },
] as const;

export function DashboardQuickActions() {
  return (
    <section aria-labelledby="dash-acciones">
      <h2 id="dash-acciones" className="sr-only">
        Accesos rápidos
      </h2>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {actions.map((a) => (
          <ActionCard
            key={a.href}
            href={a.href}
            label={a.label}
            description={a.sub}
            icon={<a.icon className="size-5" aria-hidden />}
          />
        ))}
      </div>
    </section>
  );
}
