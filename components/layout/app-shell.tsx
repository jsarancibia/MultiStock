import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type AppShellProps = {
  header: ReactNode;
  sidebar: ReactNode;
  children: ReactNode;
  className?: string;
};

/**
 * Estructura full-viewport: header fijo en altura, fila bajo con sidebar + main.
 * El scroll vertical ocurre solo en `main` (arquitectura 10: menú fijo, contenido móvil).
 */
export function AppShell({ header, sidebar, children, className }: AppShellProps) {
  return (
    <div
      className={cn(
        "flex h-dvh min-h-0 w-full max-w-full flex-col overflow-x-hidden bg-background",
        className
      )}
    >
      {header}
      <div className="flex min-h-0 w-full max-w-full flex-1 flex-col md:flex-row">
        {sidebar}
        <main className="min-h-0 w-full min-w-0 flex-1 overflow-y-auto overflow-x-hidden bg-muted/30 p-3 sm:p-4 md:p-6 dark:bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
