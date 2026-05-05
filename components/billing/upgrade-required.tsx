import Link from "next/link";
import { Lock } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type UpgradeRequiredProps = {
  title?: string;
  description?: string;
};

export function UpgradeRequired({
  title = "Función disponible desde Pro",
  description = "Tu negocio está en el plan Gratis. Actualiza el plan para desbloquear esta sección.",
}: UpgradeRequiredProps) {
  return (
    <section className="rounded-2xl border border-amber-200/80 bg-amber-50/80 p-6 text-amber-950 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-100">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="grid size-11 shrink-0 place-items-center rounded-full bg-amber-200/70 text-amber-950 dark:bg-amber-500/20 dark:text-amber-100">
          <Lock className="size-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm leading-relaxed opacity-90">{description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/pricing" className={cn(buttonVariants())}>
              Ver planes
            </Link>
            <Link href="/dashboard" className={cn(buttonVariants({ variant: "outline" }))}>
              Volver al dashboard
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
