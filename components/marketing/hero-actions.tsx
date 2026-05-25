import Link from "next/link";
import {
  BarChart3,
  Bell,
  Boxes,
  FileDown,
  Receipt,
  ShieldCheck,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const trustBadges = [
  { label: "Inventario", icon: Boxes },
  { label: "Ventas", icon: Receipt },
  { label: "Alertas", icon: Bell },
  { label: "Reportes", icon: BarChart3 },
  { label: "CSV / Exportación", icon: FileDown },
] as const;

const primaryBtnClass =
  "min-h-12 px-7 text-[1rem] font-semibold shadow-lg shadow-primary/30 transition hover:shadow-xl hover:shadow-primary/40 hover:scale-[1.02]";

const secondaryBtnClass =
  "min-h-12 border-border/70 bg-background/60 px-6 text-[1rem] font-medium backdrop-blur-sm transition hover:border-primary/50 hover:bg-background/90 hover:scale-[1.02] dark:bg-background/40";

export function HeroActions() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Link
          href="/auth/register"
          className={cn(buttonVariants({ size: "lg" }), primaryBtnClass)}
        >
          Crear cuenta gratis
        </Link>
        <Link
          href="/auth/login"
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            secondaryBtnClass
          )}
        >
          Iniciar sesión
        </Link>
        <Link
          href="/demo"
          className="text-center text-[0.9375rem] font-medium text-muted-foreground underline-offset-4 hover:text-primary hover:underline sm:text-left"
        >
          Ver demo
        </Link>
      </div>

      <div className="flex items-center gap-2 text-[0.9375rem] text-muted-foreground">
        <ShieldCheck className="size-4 text-primary" aria-hidden />
        Sin tarjeta. Configuración en minutos.
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {trustBadges.map(({ label, icon: Icon }, i) => (
          <div key={label} className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary transition hover:border-primary/40 hover:bg-primary/15">
              <Icon className="size-4" aria-hidden />
              {label}
            </span>
            {i < trustBadges.length - 1 && (
              <span className="hidden h-4 w-px bg-border sm:block" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
