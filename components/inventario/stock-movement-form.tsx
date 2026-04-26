"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import type { StockMovementActionState } from "@/modules/core/stock-movements/actions";

type ProductOption = {
  id: string;
  name: string;
  unit_type: string;
  current_stock: string;
};

const initialState: StockMovementActionState = {};

type StockMovementFormProps = {
  products: ProductOption[];
  action: (
    prevState: StockMovementActionState | undefined,
    formData: FormData
  ) => Promise<StockMovementActionState | undefined>;
};

export function StockMovementForm({ products, action }: StockMovementFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-4 rounded-lg border p-4">
      <div className="space-y-1">
        <label htmlFor="productId" className="text-sm font-medium">
          Producto
        </label>
        <select id="productId" name="productId" className="w-full rounded-md border px-3 py-2 text-sm" required>
          <option value="">Seleccionar...</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name} ({product.unit_type}) - stock: {product.current_stock}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="type" className="text-sm font-medium">
            Tipo
          </label>
          <select id="type" name="type" className="w-full rounded-md border px-3 py-2 text-sm" required>
            <option value="purchase">purchase</option>
            <option value="adjustment">adjustment</option>
            <option value="waste">waste</option>
            <option value="return">return</option>
            <option value="initial_stock">initial_stock</option>
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="quantity" className="text-sm font-medium">
            Cantidad
          </label>
          <input id="quantity" name="quantity" type="number" step="0.0001" className="w-full rounded-md border px-3 py-2 text-sm" required />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="unitCost" className="text-sm font-medium">
            Costo unitario (opcional)
          </label>
          <input id="unitCost" name="unitCost" type="number" step="0.0001" min="0" className="w-full rounded-md border px-3 py-2 text-sm" />
        </div>
        <div className="space-y-1">
          <label htmlFor="reason" className="text-sm font-medium">
            Motivo
          </label>
          <input id="reason" name="reason" className="w-full rounded-md border px-3 py-2 text-sm" />
        </div>
      </div>

      {state?.message ? <p className="text-sm text-destructive">{state.message}</p> : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Registrando..." : "Registrar movimiento"}
      </Button>
    </form>
  );
}
