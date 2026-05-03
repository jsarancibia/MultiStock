import type { ReactNode } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type AuthShellProps = {
  mode: "login" | "register";
  card: ReactNode;
};

export function AuthShell({ mode, card }: AuthShellProps) {
  const authSwitch =
    mode === "login"
      ? {
          href: "/auth/register",
          helper: "¿No tienes cuenta?",
          label: "Crear cuenta gratis",
        }
      : {
          href: "/auth/login",
          helper: "¿Ya tienes cuenta?",
          label: "Iniciar sesión",
        };

  return (
    <div className="relative min-h-dvh overflow-hidden bg-gradient-to-b from-background via-muted/15 to-background">
      <div
        aria-hidden
        className="pointer-events-none absolute left-[-14rem] top-12 h-[30rem] w-[30rem] rounded-full bg-primary/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-16rem] top-1/4 h-[34rem] w-[34rem] rounded-full bg-amber-900/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-18rem] left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl"
      />

      <main className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center px-4 py-8 sm:px-6">
        <div className="mb-6 flex w-full justify-center">
          <Link
            href="/"
            aria-label="Ir a la página principal"
            className="rounded-2xl outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-primary/35"
          >
            <BrandLogo
              className="h-24 w-40 rounded-2xl shadow-xl shadow-black/25 ring-1 ring-white/10 sm:h-28 sm:w-48"
              fit="contain"
              priority
              sizes="192px"
            />
          </Link>
        </div>

        <div className="w-full max-w-[440px] shrink-0 space-y-3">
          {card}

          <div className="rounded-2xl border border-border/70 bg-card/75 p-3 shadow-lg shadow-black/5 backdrop-blur dark:shadow-black/30">
            <p className="mb-2 text-center text-sm text-muted-foreground">{authSwitch.helper}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <Link
                href={authSwitch.href}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-11 w-full bg-background/70 font-semibold"
                )}
              >
                {authSwitch.label}
              </Link>
              <Link
                href="/"
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "h-11 w-full text-muted-foreground hover:text-foreground"
                )}
              >
                Página principal
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
