import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type MetricTone = "default" | "success" | "warning" | "danger" | "info";

const toneClasses: Record<MetricTone, string> = {
  default: "border-border bg-card",
  success: "border-emerald-200 bg-emerald-50/80 dark:border-emerald-500/25 dark:bg-emerald-950/20",
  warning: "border-amber-200 bg-amber-50/80 dark:border-amber-500/25 dark:bg-amber-950/20",
  danger: "border-rose-200 bg-rose-50/80 dark:border-rose-500/25 dark:bg-rose-950/20",
  info: "border-violet-200 bg-violet-50/80 dark:border-violet-500/25 dark:bg-violet-950/20",
};

type MetricCardProps = {
  label: string;
  value: string | number;
  helperText?: string;
  icon?: ReactNode;
  tone?: MetricTone;
  trailing?: ReactNode;
  className?: string;
};

export function MetricCard({
  label,
  value,
  helperText,
  icon,
  tone = "default",
  trailing,
  className,
}: MetricCardProps) {
  return (
    <article
      className={cn(
        "rounded-2xl border p-4 text-card-foreground shadow-sm transition-shadow md:p-5",
        toneClasses[tone],
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
        </div>
        {icon ? (
          <span className="rounded-xl bg-background/75 p-2 text-muted-foreground shadow-sm [&_svg]:size-4">{icon}</span>
        ) : null}
      </div>
      {helperText ? <p className="mt-2 text-xs text-muted-foreground">{helperText}</p> : null}
      {trailing ? <div className="mt-3">{trailing}</div> : null}
    </article>
  );
}
