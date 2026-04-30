import { AlertTriangle, Search, ShieldCheck } from "lucide-react";

/** Vista estilizada de nueva venta (solo maqueta CSS, sin capturas raster). */
export function DemoSaleMiniMock() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xl ring-1 ring-white/[0.06] dark:shadow-black/60">
      <div className="flex items-center justify-between gap-3 border-b border-border/70 bg-muted/25 px-3 py-2.5">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-border/70 bg-background/80 px-2.5 py-1.5 text-xs">
          <Search className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
          <span className="truncate text-muted-foreground">Buscar SKU o nombre...</span>
        </div>
        <span className="rounded-md bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
          Venta
        </span>
      </div>
      <div className="divide-y divide-border/60 px-3 py-1 text-[11px] sm:text-xs">
        <div className="flex items-center justify-between gap-3 py-2.5">
          <div className="min-w-0">
            <p className="truncate font-medium">Arroz largo fino · 1 kg</p>
            <p className="truncate text-muted-foreground">cant. · 4 u · método efectivo</p>
          </div>
          <p className="font-semibold tabular-nums">$ 4800</p>
        </div>
        <div className="flex items-center justify-between gap-3 py-2.5">
          <div className="min-w-0">
            <p className="truncate font-medium">Yerba 1 kg</p>
            <p className="truncate text-muted-foreground">cant. · 2 u</p>
          </div>
          <p className="font-semibold tabular-nums">$ 3100</p>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-border/70 bg-muted/20 px-3 py-2.5 text-xs">
        <span className="font-medium text-muted-foreground">Total</span>
        <span className="text-base font-semibold tracking-tight">$ 7900</span>
      </div>
    </div>
  );
}

/** Vista estilizada de alertas operativas. */
export function DemoAlertsMiniMock() {
  return (
    <div className="space-y-2.5">
      <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/25 bg-amber-950/25 p-3 text-xs sm:p-4">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-400" aria-hidden />
        <div>
          <p className="font-medium text-foreground">Stock bajo: Aceite vegetal · 900 ml</p>
          <p className="mt-1 text-muted-foreground">
            Quedan 8 unidades. El stock mínimo es 24. Sugerencia: cargar entrada o ordenar reposición con el proveedor
            habitual.
          </p>
        </div>
      </div>
      <div className="flex items-start gap-2.5 rounded-xl border border-border/70 bg-muted/20 p-3 text-xs sm:p-4">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-500" aria-hidden />
        <div>
          <p className="font-medium text-foreground">Perecedero con vida útil cercana</p>
          <p className="mt-1 text-muted-foreground">
            Tomate cherry — rotación sugerida en mostrador antes del fin de vida útil indicada para evitar pérdidas.
          </p>
        </div>
      </div>
    </div>
  );
}

/** Bloque tipo “lista de precios/stock” para el paso de productos/inventario. */
export function DemoInventoryMiniMock() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-card to-muted/35 shadow-xl ring-1 ring-white/[0.06] dark:shadow-black/60">
      <div className="grid gap-px border-b border-border/60 bg-border/80 text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:text-[11px] [grid-template-columns:1.2fr_0.5fr_0.5fr_0.6fr]">
        <div className="bg-muted/35 px-2 py-2 sm:px-3">Producto</div>
        <div className="bg-muted/35 px-1 py-2 text-center">Stock</div>
        <div className="bg-muted/35 px-1 py-2 text-center">Mín.</div>
        <div className="bg-muted/35 px-2 py-2 text-right">Estado</div>
      </div>
      <div className="divide-y divide-border/50 text-[11px] sm:text-xs">
        {[
          { name: "Leche entera 1 L", stock: "18", min: "12", ok: true },
          { name: "Manteca 100 g", stock: "4", min: "10", ok: false },
          { name: "Fiambre pechuga", stock: "8", min: "6", ok: true },
        ].map((row) => (
          <div
            key={row.name}
            className="grid [grid-template-columns:1.2fr_0.5fr_0.5fr_0.6fr] items-center bg-background/35 px-2 py-2 sm:px-3"
          >
            <span className="truncate font-medium">{row.name}</span>
            <span className="text-center tabular-nums">{row.stock}</span>
            <span className="text-center tabular-nums text-muted-foreground">{row.min}</span>
            <span
              className={`text-right text-[10px] font-semibold sm:text-xs ${row.ok ? "text-emerald-500" : "text-amber-500"}`}
            >
              {row.ok ? "OK" : "¡Revisar!"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
