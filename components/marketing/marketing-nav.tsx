import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/session";
import { getActiveBusiness } from "@/lib/business/get-active-business";
import { cn } from "@/lib/utils";
import brandLogo from "@/assets/logo-system/responsive/compact-logo-light.png";

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
            <Image
              src={brandLogo}
              alt="MultiStock"
              height={32}
              className="h-8 w-auto"
              priority
            />
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
        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <Link
              href={panelHref}
              className={cn(buttonVariants({ variant: "default", size: "sm" }))}
            >
              Ir al panel
            </Link>
          ) : (
            <>
              <Link
                href="/auth/login"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
              >
                Ingresar
              </Link>
              <Link
                href="/auth/register"
                className={cn(buttonVariants({ size: "sm" }))}
              >
                Crear cuenta
              </Link>
            </>
          )}
        </div>
      </div>
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
