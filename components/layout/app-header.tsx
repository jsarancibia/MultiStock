import { LogOut } from "lucide-react";
import { logoutAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/brand/brand-logo";

type AppHeaderProps = {
  businessName: string;
  businessTypeLabel: string;
  userEmail: string;
  switcher?: ReactNode;
};

function userInitials(email: string) {
  const local = email.split("@")[0] ?? "U";
  if (local.length >= 2) return local.slice(0, 2).toUpperCase();
  return (local[0] ?? "U").toUpperCase();
}

export function AppHeader({
  businessName,
  businessTypeLabel,
  userEmail,
  switcher,
}: AppHeaderProps) {
  return (
    <header
      className={cn(
        "z-30 shrink-0 border-b border-border bg-card/95 px-3 py-2 shadow-sm backdrop-blur-sm",
        "sm:px-4 md:px-5"
      )}
    >
      <div className="mx-auto flex w-full max-w-full min-w-0 flex-wrap items-center justify-between gap-2 sm:gap-3">
        {/* Logo + Business info */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <BrandLogo
            className="h-10 w-14 shrink-0 rounded-xl"
            fit="cover"
            priority
            sizes="56px"
          />
          <div className="min-w-0">
            <p className="truncate text-base font-semibold tracking-tight text-foreground md:text-lg">
              {businessName}
            </p>
            <p className="truncate text-xs text-muted-foreground sm:text-sm">
              <span>{businessTypeLabel}</span>
              <span className="text-muted-foreground/60"> · </span>
              <span title={userEmail}>
                {userEmail}
              </span>
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex w-full min-w-0 flex-wrap items-center justify-end gap-2 sm:w-auto sm:gap-2">
          <span className="inline-flex items-center rounded-full border border-emerald-200/90 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800 ring-1 ring-emerald-100/80 dark:border-emerald-800/60 dark:bg-emerald-950/50 dark:text-emerald-300">
            Operación activa
          </span>

          {switcher}

          <ThemeToggle />

          <div className="flex min-w-0 items-center gap-1.5 rounded-2xl border border-border bg-background/80 px-2 py-1.5 pl-1 shadow-sm">
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-bold text-muted-foreground"
              aria-hidden
            >
              {userInitials(userEmail)}
            </span>
            <form action={logoutAction} className="shrink-0">
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 px-2"
              >
                <LogOut className="size-3.5" />
                <span className="hidden sm:inline">Salir</span>
              </Button>
            </form>
          </div>
        </div>
      </div>
    </header>
  );
}
