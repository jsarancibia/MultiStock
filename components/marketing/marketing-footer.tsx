import Link from "next/link";

export function MarketingFooter() {
  return (
    <footer className="mt-auto border-t border-border/80 bg-muted/20">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium text-foreground">MultiStock</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Inventario y ventas para comercios en Chile que no tienen tiempo para sistemas rígidos.
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm" aria-label="Pie de página">
            <Link className="text-muted-foreground hover:text-foreground" href="/features">
              Características
            </Link>
            <Link className="text-muted-foreground hover:text-foreground" href="/pricing">
              Precios
            </Link>
            <Link className="text-muted-foreground hover:text-foreground" href="/demo">
              Demo
            </Link>
            <Link className="text-muted-foreground hover:text-foreground" href="/auth/login">
              Ingresar
            </Link>
          </nav>
        </div>
        <p className="mt-8 text-xs text-muted-foreground">
          © {new Date().getFullYear()} MultiStock. Hecho para negocios en Chile.
        </p>
      </div>
    </footer>
  );
}
