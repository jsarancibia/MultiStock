import Image from "next/image";
import brandMark from "@/assets/logo-system/responsive/icon-only-mark-light.png";

/** Bloque decorativo estilo “screenshot” para la landing. */
export function DashboardMockup() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-b from-card to-muted/30 shadow-2xl shadow-foreground/5">
      <div className="border-b border-border/60 bg-muted/40 px-3 py-2">
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-red-400/80" />
          <span className="size-2.5 rounded-full bg-amber-400/80" />
          <span className="size-2.5 rounded-full bg-emerald-400/80" />
        </div>
      </div>
      <div className="grid gap-0 lg:grid-cols-[10rem_1fr]">
        <aside className="hidden border-r border-border/60 bg-muted/25 p-3 lg:block">
          <div className="mb-3 flex items-center justify-center">
            <Image src={brandMark} alt="" width={36} height={36} className="opacity-80" />
          </div>
          <div className="space-y-1.5">
            {["Dashboard", "Productos", "Ventas", "Alertas"].map((item) => (
              <div
                key={item}
                className="rounded-md px-2 py-1.5 text-xs text-muted-foreground/90"
                style={{ opacity: item === "Dashboard" ? 1 : 0.6 }}
              >
                {item}
              </div>
            ))}
          </div>
        </aside>
        <div className="p-4 sm:p-6">
          <div className="mb-4 h-2 w-40 rounded bg-muted" />
          <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-16 rounded-lg border border-dashed border-border/80 bg-background/50"
              />
            ))}
          </div>
          <div className="h-40 rounded-xl border border-border/60 bg-gradient-to-tr from-primary/5 via-transparent to-muted/40" />
        </div>
      </div>
    </div>
  );
}
