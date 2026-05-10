"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { panelInputClass, panelSelectClass } from "@/components/ui/form-field-styles";
import { FormMessage } from "@/components/ui/form-message";
import { quickUpdateProductAction } from "@/modules/core/products/actions";
import type { ProductActionState } from "@/modules/core/products/actions";
import { Loader2 } from "lucide-react";

type InlineProductEditorProps = {
  productId: string;
  initialSupplierId: string | null;
  initialSalePrice: string;
  initialCostPrice: string;
  initialActive: boolean;
  suppliers: { id: string; name: string }[];
  onSaved: () => void;
  onCancel: () => void;
};

const initialState: ProductActionState = {};

export function InlineProductEditor({
  productId,
  initialSupplierId,
  initialSalePrice,
  initialCostPrice,
  initialActive,
  suppliers,
  onSaved,
  onCancel,
}: InlineProductEditorProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    quickUpdateProductAction.bind(null, productId),
    initialState,
  );

  const success = state?.success;

  // Si la acción fue exitosa, llamamos onSaved y refrescamos datos del servidor
  if (success) {
    // Llamar after render para evitar setState durante render
    queueMicrotask(() => {
      onSaved();
      router.refresh();
    });
  }

  return (
    <form action={formAction} className="space-y-3 rounded-lg border border-border bg-muted/30 p-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor={`supplier-${productId}`} className="text-xs font-medium text-foreground">
            Proveedor
          </label>
          <select
            id={`supplier-${productId}`}
            name="supplierId"
            className={panelSelectClass}
            defaultValue={initialSupplierId ?? ""}
          >
            <option value="">Sin proveedor</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor={`active-${productId}`} className="text-xs font-medium text-foreground">
            Estado
          </label>
          <select
            id={`active-${productId}`}
            name="active"
            className={panelSelectClass}
            defaultValue={initialActive ? "true" : "false"}
          >
            <option value="true">Activo</option>
            <option value="false">Inactivo</option>
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor={`salePrice-${productId}`} className="text-xs font-medium text-foreground">
            Precio venta
          </label>
          <input
            id={`salePrice-${productId}`}
            name="salePrice"
            type="number"
            step="0.01"
            min="0"
            className={panelInputClass}
            defaultValue={initialSalePrice}
            required
          />
        </div>
        <div className="space-y-1">
          <label htmlFor={`costPrice-${productId}`} className="text-xs font-medium text-foreground">
            Precio costo
          </label>
          <input
            id={`costPrice-${productId}`}
            name="costPrice"
            type="number"
            step="0.01"
            min="0"
            className={panelInputClass}
            defaultValue={initialCostPrice}
            required
          />
        </div>
      </div>

      <FormMessage message={state?.message} />
      {state?.errors?.salePrice?.[0] ? (
        <p className="text-xs text-rose-600">{state.errors.salePrice[0]}</p>
      ) : null}
      {state?.errors?.costPrice?.[0] ? (
        <p className="text-xs text-rose-600">{state.errors.costPrice[0]}</p>
      ) : null}

      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="size-3 animate-spin" aria-hidden />
              Guardando...
            </>
          ) : (
            "Guardar"
          )}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={pending}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
