import Link from "next/link";
import { BarChart3, Bell, Boxes, Receipt } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const trustItems = [
  { label: "Inventario", icon: Boxes },
  { label: "Ventas", icon: Receipt },
  { label: "Alertas", icon: Bell },
  { label: "Reportes", icon: BarChart3 },
] as const;

const primaryBtnClass =
  "min-h-11 px-6 text-[0.9375rem] font-semibold shadow-md shadow-primary/25 transition hover:shadow-lg hover:shadow-primary/35";

const secondaryBtnClass =
  "min-h-11 border-border/70 bg-background/60 px-5 text-[0.9375rem] font-medium backdrop-blur-sm transition hover:border-primary/50 hover:bg-background/90 dark:bg-background/40";

export function HeroActions() {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Link
          href="/auth/register"
          className={cn(buttonVariants({ size: "lg" }), primaryBtnClass)}
        >
          Crear cuenta gratis
        </Link>
        <Link
          href="/auth/login"
          className={cn(buttonVariants({ variant: "outline", size: "lg" }), secondaryBtnClass)}
        >
          Iniciar sesión
        </Link>
        <Link
          href="/demo"
          className="text-center text-sm font-medium text-muted-foreground underline-offset-4 hover:text-primary hover:underline sm:text-left"
        >
          Ver demo
        </Link>
      </div>
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">
          Sin tarjeta. Configuración en minutos.
        </p>
        <Link
          href="/features"
          className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Ver todas las funcionalidades
        </Link>
      </div>

      <ul
        className="flex flex-wrap gap-2"
        aria-label="Funciones principales incluidas"
      >
        {trustItems.map(({ label, icon: Icon }) => (
          <li
            key={label}
            className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/50 px-3 py-1.5 text-xs font-medium text-foreground backdrop-blur-sm transition hover:border-primary/40 dark:bg-muted/40"
          >
            <Icon className="size-3.5 text-primary" aria-hidden />
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}
