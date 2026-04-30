import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SimpleChartCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function SimpleChartCard({ title, description, children, className }: SimpleChartCardProps) {
  return (
    <article className={cn("rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-sm", className)}>
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      {description ? <p className="mt-1 text-xs text-muted-foreground">{description}</p> : null}
      <div className="mt-4">{children}</div>
    </article>
  );
}
