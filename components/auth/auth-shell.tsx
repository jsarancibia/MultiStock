import type { ReactNode } from "react";
import { BrandLogo } from "@/components/brand/brand-logo";

export type AuthShellProps = {
  mode: "login" | "register";
  card: ReactNode;
};

export function AuthShell({ card }: AuthShellProps) {
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
          <BrandLogo
            className="h-24 w-40 rounded-2xl shadow-xl shadow-black/25 ring-1 ring-white/10 sm:h-28 sm:w-48"
            fit="contain"
            priority
            sizes="192px"
          />
        </div>

        <div className="w-full max-w-[440px] shrink-0">{card}</div>
      </main>
    </div>
  );
}
