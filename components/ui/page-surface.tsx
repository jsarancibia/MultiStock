import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageSurfaceProps = {
  children: ReactNode;
  className?: string;
};

export function PageSurface({ children, className }: PageSurfaceProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card/95 p-4 text-card-foreground shadow-sm backdrop-blur-sm md:rounded-3xl md:p-6",
        className
      )}
    >
      {children}
    </div>
  );
}
