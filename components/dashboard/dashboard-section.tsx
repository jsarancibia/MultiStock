import type { ReactNode } from "react";

type DashboardSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function DashboardSection({ title, description, children }: DashboardSectionProps) {
  return (
    <div className="rounded-2xl border border-border/80 bg-card/30 p-5 shadow-sm">
      <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
      {description ? (
        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{description}</p>
      ) : null}
      <div className="mt-4">{children}</div>
    </div>
  );
}
