import { BrandLogo } from "@/components/brand/brand-logo";

export function DashboardMockup() {
  return (
    <div className="relative">
      <div
        className="absolute -inset-4 rounded-2xl bg-gradient-to-tr from-primary/30 via-emerald-400/20 to-amber-500/10 blur-2xl"
        style={{ animation: "pulse-glow 3s ease-in-out infinite" }}
      />
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-b from-card to-muted/30 shadow-2xl shadow-black/25 ring-1 ring-white/10 dark:shadow-black/60 dark:ring-white/5">
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
              <BrandLogo
                alt=""
                className="h-9 w-12 rounded-lg opacity-80"
                fit="cover"
                sizes="48px"
              />
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
            <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[40, 65, 30, 80].map((height, i) => (
                <div
                  key={i}
                  className="flex items-end justify-center gap-[3px] rounded-lg border border-dashed border-border/80 bg-background/50 p-2"
                >
                  {[0.4, 0.7, 0.5, 0.9, 0.6].map((bar, j) => (
                    <div
                      key={j}
                      className="w-[5px] rounded-t-[2px] bg-primary/40"
                      style={{ height: `${bar * (height * 0.7)}px` }}
                    />
                  ))}
                </div>
              ))}
            </div>
            <div className="h-40 rounded-xl border border-border/60 bg-gradient-to-tr from-primary/5 via-transparent to-muted/40 overflow-hidden">
              <svg
                viewBox="0 0 200 80"
                className="h-full w-full"
                preserveAspectRatio="none"
                aria-hidden
              >
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="currentColor" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="currentColor" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <path
                  d="M0 70 L33 45 L66 55 L100 20 L133 35 L166 15 L200 30 L200 80 L0 80 Z"
                  className="text-primary"
                  fill="url(#chartGrad)"
                />
                <path
                  d="M0 70 L33 45 L66 55 L100 20 L133 35 L166 15 L200 30"
                  className="text-primary"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={0.8}
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
