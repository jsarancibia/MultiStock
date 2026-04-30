import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string | number;
  helperText?: string;
  icon?: ReactNode;
  /** Resalta la tarjeta (p. ej. alertas). */
  emphasize?: boolean;
  className?: string;
};

export function StatCard({
  label,
  value,
  helperText,
  icon,
  emphasize,
  className,
}: StatCardProps) {
  return (
    <article
      className={cn(
        "rounded-xl border p-4 transition-shadow",
        emphasize
          ? "border-amber-200/90 bg-amber-50/50 shadow-sm dark:border-amber-900/40 dark:bg-amber-950/25"
          : "border-border/80 bg-card/40",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-sm font-medium text-muted-foreground">{label}</h2>
        {icon ? <span className="text-muted-foreground [&_svg]:size-4">{icon}</span> : null}
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight">{value}</p>
      {helperText ? (
        <p className="mt-1 text-xs text-muted-foreground leading-snug">{helperText}</p>
      ) : null}
    </article>
  );
}
