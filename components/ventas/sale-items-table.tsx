"use client";

import { useState } from "react";
import { panelInputCompactClass } from "@/components/ui/form-field-styles";
import {
  allowsDecimalQuantity,
  quantityInputConstraints,
  quantityUnitAbbrev,
  stabilizeQuantityInputValue,
  unitPriceFieldLabel,
} from "@/lib/business/unit-quantity";
import { formatCurrency, formatQuantity } from "@/lib/utils";

const mobileNumericClass = `${panelInputCompactClass} min-h-11 touch-manipulation text-base md:text-sm`;

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
  onRemove: (productId: string) => void;
};

export function SaleItemsTable({
  items,
  onUpdateQuantity,
  onRemove,
}: SaleItemsTableProps) {
  const [quantityDrafts, setQuantityDrafts] = useState<Record<string, string>>({});

  function setQuantityDraft(productId: string, value: string) {
    setQuantityDrafts((prev) => ({ ...prev, [productId]: value }));
  }

  function clearQuantityDraft(productId: string) {
    setQuantityDrafts((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
  }

  function quantityInputValue(productId: string, quantity: number, unitType: string): string | number {
    const draft = quantityDrafts[productId];
    if (draft !== undefined) return draft;
    return stabilizeQuantityInputValue(quantity, unitType);
  }

  function onQuantityChange(productId: string, raw: string) {
    setQuantityDraft(productId, raw);
    if (!raw.trim()) return;
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) return;
    onUpdateQuantity(productId, parsed);
  }

  function onQuantityBlur(productId: string) {
    const raw = quantityDrafts[productId];
    if (raw === undefined) return;
    const parsed = Number(raw);
    if (raw.trim() && Number.isFinite(parsed)) {
      onUpdateQuantity(productId, parsed);
    }
    clearQuantityDraft(productId);
  }

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
              const qAttrs = quantityInputConstraints(item.unitType);
              const unitAbbr = quantityUnitAbbrev(item.unitType);
              const qtyDisplay = quantityInputValue(item.productId, item.quantity, item.unitType);
              const priceLabel = unitPriceFieldLabel(item.unitType);
              return (
                <li
                  key={item.productId}
                  className="rounded-lg border border-border bg-card p-3 text-card-foreground shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium leading-snug">{item.name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Stock: {formatQuantity(item.stock, 2)} {unitAbbr}
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
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">
                        Cantidad{allowsDecimalQuantity(item.unitType) ? ` (${unitAbbr})` : ""}
                      </label>
                      <input
                        type="number"
                        aria-label={`Cantidad en ${unitAbbr} para ${item.name}`}
                        min={qAttrs.min}
                        step={qAttrs.step}
                        value={qtyDisplay}
                        onChange={(event) => onQuantityChange(item.productId, event.target.value)}
                        onBlur={() => onQuantityBlur(item.productId)}
                        className={mobileNumericClass}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">
                        {priceLabel}
                      </label>
                      <p className="text-sm font-semibold text-foreground">
                        {formatCurrency(item.unitPrice)}
                      </p>
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
        <p className="border-b bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          Para productos por kg, L o m podés usar decimales; unidades y cajas solo enteros.
        </p>
        <table className="w-full min-w-[520px] text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="px-3 py-2 font-medium">Producto</th>
              <th className="px-3 py-2 font-medium">Cantidad</th>
              <th className="px-3 py-2 font-medium">Precio</th>
              <th className="px-3 py-2 font-medium">Subtotal</th>
              <th className="px-3 py-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const subtotal = item.quantity * item.unitPrice;
              const qAttrs = quantityInputConstraints(item.unitType);
              const unitAbbr = quantityUnitAbbrev(item.unitType);
              const qtyDisplay = quantityInputValue(item.productId, item.quantity, item.unitType);
              const priceLabel = unitPriceFieldLabel(item.unitType);
              return (
                <tr key={item.productId} className="border-t">
                  <td className="px-3 py-2">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Stock: {formatQuantity(item.stock, 2)} {unitAbbr}
                    </p>
                  </td>
                  <td className="px-3 py-2">
                    <p className="mb-1 text-[11px] text-muted-foreground">{unitAbbr}</p>
                    <input
                      type="number"
                      aria-label={`Cantidad en ${unitAbbr} para ${item.name}`}
                      min={qAttrs.min}
                      step={qAttrs.step}
                      value={qtyDisplay}
                      onChange={(event) => onQuantityChange(item.productId, event.target.value)}
                      onBlur={() => onQuantityBlur(item.productId)}
                      className={panelInputCompactClass}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <p className="mb-1 text-[11px] text-muted-foreground">{priceLabel}</p>
                    <p className="font-medium text-foreground">{formatCurrency(item.unitPrice)}</p>
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
