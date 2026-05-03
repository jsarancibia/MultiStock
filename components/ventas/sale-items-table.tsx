"use client";

import { panelInputCompactClass } from "@/components/ui/form-field-styles";
import { formatCurrency, formatQuantity } from "@/lib/utils";

const DECIMAL_UNITS = new Set(["kg", "g", "liter", "meter"]);

function quantityInputAttrs(unitType: string) {
  if (DECIMAL_UNITS.has(unitType)) {
    return { min: 0.01, step: 0.01 } as const;
  }
  return { min: 1, step: 1 } as const;
}

export type SaleCartItem = {
  productId: string;
  name: string;
  unitType: string;
  stock: number;
  quantity: number;
  unitPrice: number;
};

type SaleItemsTableProps = {
  items: SaleCartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onUpdateUnitPrice: (productId: string, unitPrice: number) => void;
  onRemove: (productId: string) => void;
};

export function SaleItemsTable({
  items,
  onUpdateQuantity,
  onUpdateUnitPrice,
  onRemove,
}: SaleItemsTableProps) {
  const emptyRow = (
    <tr>
      <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">
        Todavía no agregaste productos a la venta.
      </td>
    </tr>
  );

  return (
    <div className="space-y-3">
      <div className="md:hidden">
        {!items.length ? (
          <div className="rounded-lg border border-border bg-card px-3 py-6 text-center text-sm text-muted-foreground">
            Todavía no agregaste productos a la venta.
          </div>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => {
              const subtotal = item.quantity * item.unitPrice;
              const qAttrs = quantityInputAttrs(item.unitType);
              return (
                <li
                  key={item.productId}
                  className="rounded-lg border border-border bg-card p-3 text-card-foreground shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium leading-snug">{item.name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Stock: {formatQuantity(item.stock)} {item.unitType}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemove(item.productId)}
                      className="shrink-0 rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground hover:bg-muted"
                      aria-label={`Quitar ${item.name} de la venta`}
                    >
                      Quitar
                    </button>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">Cantidad</label>
                      <input
                        type="number"
                        aria-label={`Cantidad de ${item.name}`}
                        min={qAttrs.min}
                        step={qAttrs.step}
                        value={item.quantity}
                        onChange={(event) => onUpdateQuantity(item.productId, Number(event.target.value))}
                        className={panelInputCompactClass}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">Precio unit.</label>
                      <input
                        type="number"
                        aria-label={`Precio unitario de ${item.name}`}
                        min="0"
                        step="0.0001"
                        value={item.unitPrice}
                        onChange={(event) => onUpdateUnitPrice(item.productId, Number(event.target.value))}
                        className={panelInputCompactClass}
                      />
                    </div>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-foreground">Subtotal: {formatCurrency(subtotal)}</p>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="hidden overflow-x-auto rounded-lg border border-border bg-card md:block">
        <table className="w-full min-w-[520px] text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="px-3 py-2 font-medium">Producto</th>
              <th className="px-3 py-2 font-medium">Cantidad</th>
              <th className="px-3 py-2 font-medium">Precio unit.</th>
              <th className="px-3 py-2 font-medium">Subtotal</th>
              <th className="px-3 py-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const subtotal = item.quantity * item.unitPrice;
              const qAttrs = quantityInputAttrs(item.unitType);
              return (
                <tr key={item.productId} className="border-t">
                  <td className="px-3 py-2">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Stock: {formatQuantity(item.stock)} {item.unitType}
                    </p>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      aria-label={`Cantidad de ${item.name}`}
                      min={qAttrs.min}
                      step={qAttrs.step}
                      value={item.quantity}
                      onChange={(event) => onUpdateQuantity(item.productId, Number(event.target.value))}
                      className={panelInputCompactClass}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      aria-label={`Precio unitario de ${item.name}`}
                      min="0"
                      step="0.0001"
                      value={item.unitPrice}
                      onChange={(event) => onUpdateUnitPrice(item.productId, Number(event.target.value))}
                      className={panelInputCompactClass}
                    />
                  </td>
                  <td className="px-3 py-2">{formatCurrency(subtotal)}</td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => onRemove(item.productId)}
                      className="h-9 rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground hover:bg-muted"
                      aria-label={`Quitar ${item.name} de la venta`}
                    >
                      Quitar
                    </button>
                  </td>
                </tr>
              );
            })}
            {!items.length ? emptyRow : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
