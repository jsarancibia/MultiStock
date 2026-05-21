"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { panelInputClass } from "@/components/ui/form-field-styles";
import { FormMessage } from "@/components/ui/form-message";
import { formatQuantity } from "@/lib/utils";
import { agregarStockRapidoAction } from "@/modules/core/inventory/agregar-stock-action";

type Props = {
  productId: string;
  productName: string;
  currentStock: string;
};

type ActionState = { success?: boolean; message?: string };

const initialState: ActionState = {};

export function AgregarStockButton({ productId, productName, currentStock }: Props) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(agregarStockRapidoAction, initialState);
  const [qty, setQty] = useState("");

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
        onClick={() => setOpen(true)}
      >
        + Agregar stock
      </Button>
    );
  }

  return (
    <div className="space-y-2 rounded border bg-muted/30 p-2">
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
          required
          placeholder="Cantidad"
          className={panelInputClass}
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          autoFocus
        />
        <div className="flex gap-1">
          <Button type="submit" disabled={pending} size="xs">
            {pending ? "..." : "+ Agregar"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={() => setOpen(false)}
          >
            Cancelar
          </Button>
        </div>
        <FormMessage message={state?.message} />
      </form>
    </div>
  );
}
