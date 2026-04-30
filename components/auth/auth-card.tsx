import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type AuthCardProps = {
  badge?: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function AuthCard({ badge, title, description, children, className }: AuthCardProps) {
  return (
    <section
      className={cn(
        "relative w-full max-w-[440px] space-y-6 overflow-hidden rounded-2xl border border-border/80 bg-card p-6 shadow-xl shadow-black/10 ring-1 ring-white/5 sm:p-8 dark:shadow-black/40",
        className
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 right-[-20%] h-48 w-48 rounded-full bg-primary/15 blur-3xl"
      />
      <header className="relative space-y-2">
        {badge ? (
          <p className="inline-flex rounded-full bg-primary/12 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-primary">
            {badge}
          </p>
        ) : null}
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description ? (
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        ) : null}
      </header>
      <div className="relative">{children}</div>
    </section>
  );
}
