"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { panelInputClass } from "@/components/ui/form-field-styles";
import { FormMessage } from "@/components/ui/form-message";
import { formatQuantity } from "@/lib/utils";
import { reducirStockRapidoAction } from "@/modules/core/inventory/reducir-stock-action";
import { Trash2 } from "lucide-react";

type Props = {
  productId: string;
  productName: string;
  currentStock: string;
};

type ActionState = { success?: boolean; message?: string };

const initialState: ActionState = {};

export function ReducirStockButton({ productId, productName, currentStock }: Props) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(reducirStockRapidoAction, initialState);
  const [qty, setQty] = useState("");
  const maxStock = Math.max(0, Number(currentStock));

  useEffect(() => {
    if (state?.success) {
      setOpen(false);
      setQty("");
    }
  }, [state]);

  if (!open) {
    return (
      <Button
        type="button"
        variant="outline"
        size="xs"
        className="text-muted-foreground hover:text-destructive"
        onClick={() => setOpen(true)}
        title="Reducir stock"
      >
        <Trash2 className="size-3.5" aria-hidden />
      </Button>
    );
  }

  return (
    <div className="space-y-2 rounded border border-destructive/20 bg-destructive/5 p-2">
      <p className="text-xs font-medium">{productName}</p>
      <p className="text-xs text-muted-foreground">
        Stock actual: {formatQuantity(currentStock)}
      </p>
      <form action={formAction} className="flex flex-col gap-2">
        <input type="hidden" name="productId" value={productId} />
        <input
          name="quantity"
          type="number"
          step="1"
          min="1"
          max={maxStock || 1}
          required
          placeholder="Cantidad a reducir"
          className={panelInputClass}
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          autoFocus
        />
        <div className="flex gap-1">
          <Button type="submit" disabled={pending || !qty || Number(qty) > maxStock} size="xs" variant="destructive">
            {pending ? "..." : "Reducir"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={() => {
              setOpen(false);
              setQty("");
            }}
          >
            Cancelar
          </Button>
        </div>
        <FormMessage message={state?.message} />
      </form>
    </div>
  );
}
