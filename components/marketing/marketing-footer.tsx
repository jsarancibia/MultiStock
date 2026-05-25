import Link from "next/link";
import { Mail, MapPin } from "lucide-react";
import { gmailLink, SALES_EMAIL } from "@/lib/email-links";
import { BrandLogo } from "@/components/brand/brand-logo";

const linkClass =
  "text-sm text-muted-foreground hover:text-foreground transition-colors";

export function MarketingFooter() {
  return (
    <footer className="mt-auto border-t border-border/80 bg-muted/20">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 outline-none"
            >
              <BrandLogo
                className="h-10 w-16 rounded-xl"
                fit="contain"
                sizes="64px"
              />
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Inventario y ventas para comercios en Chile que no tienen tiempo
              para sistemas rígidos.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">Producto</p>
            <nav className="flex flex-col gap-2" aria-label="Producto">
              <Link className={linkClass} href="/features">
                Características
              </Link>
              <Link className={linkClass} href="/pricing">
                Precios
              </Link>
              <Link className={linkClass} href="/demo">
                Demo
              </Link>
              <Link className={linkClass} href="/auth/register">
                Crear cuenta
              </Link>
            </nav>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">Recursos</p>
            <nav className="flex flex-col gap-2" aria-label="Recursos">
              <Link className={linkClass} href="/features">
                Funcionalidades
              </Link>
              <Link className={linkClass} href="/auth/login">
                Ingresar al panel
              </Link>
            </nav>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">Contacto</p>
            <div className="flex flex-col gap-2">
              <a
                href={gmailLink(SALES_EMAIL, "Contacto MultiStock", "")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
              >
                <Mail className="size-4" />
                Contacto
              </a>
              <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="size-4" />
                Chile
              </span>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-border/60 pt-6">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} MultiStock. Hecho para negocios en
            Chile.
          </p>
        </div>
      </div>
    </footer>
  );
}
