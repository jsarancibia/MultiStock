import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-2 font-medium">
            <Package className="size-6 text-foreground" aria-hidden />
            <span>MultiStock</span>
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
        <div>
          <Button>Boton de ejemplo (shadcn/ui)</Button>
        </div>
      </main>
    </div>
  );
}
