import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand/brand-logo";
import { getCurrentUser } from "@/lib/auth/session";
import { getActiveBusiness } from "@/lib/business/get-active-business";
import { cn } from "@/lib/utils";

const navLinkClass =
  "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground";

export async function MarketingNav() {
  const user = await getCurrentUser();
  const business = user ? await getActiveBusiness(user.id) : null;
  const panelHref = business ? "/dashboard" : "/onboarding";

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 outline-none">
            <BrandLogo className="h-10 w-16 rounded-xl" fit="contain" priority sizes="64px" />
          </Link>
          <nav className="hidden items-center gap-6 sm:flex" aria-label="Público">
            <Link className={navLinkClass} href="/features">
              Características
            </Link>
            <Link className={navLinkClass} href="/pricing">
              Precios
            </Link>
            <Link className={navLinkClass} href="/demo">
              Demo
            </Link>
          </nav>
        </div>
        <div className="flex min-h-10 items-center justify-end gap-2 sm:gap-3">
          {user ? (
            <Link
              href={panelHref}
              className={cn(
                buttonVariants({ variant: "default", size: "default" }),
                "min-h-10 px-4 shadow-md shadow-primary/25"
              )}
            >
              Ir al panel
            </Link>
          ) : (
            <div className="hidden items-center gap-2 sm:flex sm:gap-3">
              <Link
                href="/auth/login"
                className={cn(
                  buttonVariants({ variant: "outline", size: "default" }),
                  "min-h-10 px-4 font-medium backdrop-blur-sm transition hover:border-primary/60 hover:bg-background/90 dark:bg-background/40"
                )}
              >
                Iniciar sesión
              </Link>
              <Link
                href="/auth/register"
                className={cn(
                  buttonVariants({ variant: "default", size: "default" }),
                  "min-h-10 px-4 font-semibold shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/35"
                )}
              >
                Crear cuenta
              </Link>
            </div>
          )}
        </div>
      </div>
      {!user ? (
        <div className="grid grid-cols-2 gap-2 border-t border-border/60 px-4 py-2.5 sm:hidden">
          <Link
            href="/auth/login"
            className={cn(
              buttonVariants({ variant: "outline", size: "default" }),
              "h-11 justify-center px-3 text-[0.8rem] font-medium"
            )}
          >
            Iniciar sesión
          </Link>
          <Link
            href="/auth/register"
            className={cn(
              buttonVariants({ variant: "default", size: "default" }),
              "h-11 justify-center px-3 text-[0.8rem] font-semibold shadow-md shadow-primary/25"
            )}
          >
            Crear cuenta
          </Link>
        </div>
      ) : null}
      <nav
        className="flex border-t border-border/60 px-4 py-2 sm:hidden"
        aria-label="Público móvil"
      >
        <div className="mx-auto flex w-full max-w-6xl justify-around">
          <Link className="text-xs font-medium text-muted-foreground" href="/features">
            Características
          </Link>
          <Link className="text-xs font-medium text-muted-foreground" href="/pricing">
            Precios
          </Link>
          <Link className="text-xs font-medium text-muted-foreground" href="/demo">
            Demo
          </Link>
        </div>
      </nav>
    </header>
  );
}
