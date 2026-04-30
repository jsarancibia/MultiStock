"use client";

import { useActionState, useState } from "react";
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

const movementTypeHelp: Record<string, string> = {
  purchase: "Suma unidades al stock. Podés indicar costo unitario para valorizar la compra.",
  adjustment: "Corrige diferencias de inventario (inventario físico, errores de carga).",
  waste: "Registra bajas por merma, vencimiento o rotura. Resta del stock.",
  return: "Entrada por devolución de cliente o nota de crédito.",
  initial_stock: "Solo para cargar el stock existente al incorporar un producto. Luego usá Compra o ajustes.",
};

export function StockMovementForm({ products, action }: StockMovementFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [movementType, setMovementType] = useState<keyof typeof movementTypeHelp>("purchase");

  return (
    <form action={formAction} className="space-y-4 rounded-lg border p-4">
      <div className="space-y-1">
        <label htmlFor="productId" className="text-sm font-medium">
          Producto
        </label>
        <select id="productId" name="productId" className="w-full rounded-md border px-3 py-2 text-sm" required>
          <option value="">Seleccionar…</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name} ({product.unit_type}) — stock: {product.current_stock}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">Elegí el producto afectado y verificá el stock actual en la lista.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="type" className="text-sm font-medium">
            Tipo de movimiento
          </label>
          <select
            id="type"
            name="type"
            className="w-full rounded-md border px-3 py-2 text-sm"
            required
            value={movementType}
            onChange={(e) => setMovementType(e.target.value as keyof typeof movementTypeHelp)}
          >
            <option value="purchase">Compra</option>
            <option value="adjustment">Ajuste</option>
            <option value="waste">Merma</option>
            <option value="return">Devolución</option>
            <option value="initial_stock">Stock inicial</option>
          </select>
          <p className="text-xs text-muted-foreground">{movementTypeHelp[movementType]}</p>
        </div>
        <div className="space-y-1">
          <label htmlFor="quantity" className="text-sm font-medium">
            Cantidad
          </label>
          <input id="quantity" name="quantity" type="number" step="0.0001" min="0" className="w-full rounded-md border px-3 py-2 text-sm" required />
          <p className="text-xs text-muted-foreground">Usá decimales para productos a peso o por litro (ej. 0,25 kg).</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="unitCost" className="text-sm font-medium">
            Costo unitario (opcional)
          </label>
          <input id="unitCost" name="unitCost" type="number" step="0.0001" min="0" className="w-full rounded-md border px-3 py-2 text-sm" />
          <p className="text-xs text-muted-foreground">Suele usarse en compras para actualizar el costo del producto.</p>
        </div>
        <div className="space-y-1">
          <label htmlFor="reason" className="text-sm font-medium">
            Motivo
          </label>
          <input id="reason" name="reason" className="w-full rounded-md border px-3 py-2 text-sm" />
          <p className="text-xs text-muted-foreground">Breve nota (ej. factura, remito, control de cámara).</p>
        </div>
      </div>

      {state?.message ? <p className="text-sm text-destructive">{state.message}</p> : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Registrando..." : "Registrar movimiento"}
      </Button>
    </form>
  );
}
