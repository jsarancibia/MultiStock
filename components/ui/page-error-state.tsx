import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PageErrorStateProps = {
  title?: string;
  description?: string;
  onRetry?: () => void;
};

export function PageErrorState({
  title = "Ocurrió un error inesperado",
  description = "No pudimos cargar esta sección. Puedes reintentar o volver al dashboard.",
  onRetry,
}: PageErrorStateProps) {
  return (
    <section className="flex min-h-[40vh] flex-col items-center justify-center rounded-xl border border-dashed px-6 py-10 text-center">
      <AlertTriangle className="mb-3 size-8 text-amber-600 dark:text-amber-400" aria-hidden />
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {onRetry ? (
          <Button type="button" onClick={onRetry}>
            Reintentar
          </Button>
        ) : null}
        <Link href="/dashboard" className={cn(buttonVariants({ variant: "outline" }))}>
          Volver al dashboard
        </Link>
      </div>
    </section>
  );
}
