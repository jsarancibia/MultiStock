import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description: string;
  /** Contenido visual opcional (p. ej. icono) encima del título. */
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <section
      className={cn(
        "flex min-h-[12rem] flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 px-6 py-10 text-center",
        className
      )}
      role="status"
    >
      {icon ? <div className="mb-3 text-muted-foreground [&_svg]:size-10">{icon}</div> : null}
      <div className="max-w-sm space-y-1.5">
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {action ? <div className="mt-5 flex w-full max-w-xs flex-col items-stretch gap-2 sm:flex-row sm:justify-center">
        {action}
      </div> : null}
    </section>
  );
}
