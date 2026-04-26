import Link from "next/link";
import { redirect } from "next/navigation";
import { Package } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { getActiveBusiness } from "@/lib/business/get-active-business";

export default async function Home() {
  const user = await getCurrentUser();

  if (user) {
    const business = await getActiveBusiness(user.id);
    redirect(business ? "/dashboard" : "/onboarding");
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-2 font-medium">
            <Package className="size-6 text-foreground" aria-hidden />
            <span>MultiStock</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/auth/login"
              className="inline-flex h-8 items-center rounded-lg px-2.5 text-sm font-medium hover:bg-muted"
            >
              Ingresar
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex h-8 items-center rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Crear cuenta
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center gap-8 px-4 py-16">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            Control de inventario
          </h1>
          <p className="text-muted-foreground text-lg">
            Proyecto inicial. Configura <code className="rounded bg-muted px-1.5 py-0.5 text-sm">.env.local</code> con Supabase para
            conectar el backend.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          Rubros iniciales soportados: verduleria, almacen y ferreteria.
        </p>
      </main>
    </div>
  );
}
