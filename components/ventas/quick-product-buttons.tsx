"use client";

import { cn, formatCurrency } from "@/lib/utils";
import type { SaleProductOption } from "@/components/ventas/product-search";

type QuickProductButtonsProps = {
  products: SaleProductOption[];
  onAdd: (product: SaleProductOption) => void;
};

export function QuickProductButtons({ products, onAdd }: QuickProductButtonsProps) {
  if (!products.length) return null;

  return (
    <div className="space-y-3 rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="font-medium text-foreground">Acceso rápido</h2>
        <p className="text-xs text-muted-foreground">Toca para agregar</p>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {products.map((product) => (
          <button
            key={product.id}
            type="button"
            onClick={() => onAdd(product)}
            className={cn(
              "flex flex-col items-start gap-1 rounded-xl border border-border bg-background px-3 py-3 text-left shadow-sm transition-all",
              "hover:border-amber-400 hover:bg-amber-50/60 hover:shadow active:scale-[0.97]",
              "dark:hover:border-amber-400/70 dark:hover:bg-amber-950/20"
            )}
          >
            <span className="line-clamp-2 text-sm font-medium leading-tight text-foreground">
              {product.name}
            </span>
            <span className="text-xs text-muted-foreground">{formatCurrency(product.sale_price)}</span>
            <span className="text-[10px] text-muted-foreground/70">
              Stock: {product.current_stock} {product.unit_type}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
