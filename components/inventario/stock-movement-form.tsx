"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import { BarcodeScanButton } from "@/components/barcode/barcode-scan-button";
import { Button } from "@/components/ui/button";
import {
  formMutedSectionClass,
  formSecondaryButtonClass,
  panelInputClass,
  panelSelectClass,
} from "@/components/ui/form-field-styles";
import { FormMessage } from "@/components/ui/form-message";
import { cn } from "@/lib/utils";
import { findActiveProductByBarcode } from "@/modules/core/products/actions";
import type { StockMovementActionState } from "@/modules/core/stock-movements/actions";

type ProductOption = {
  id: string;
  name: string;
  unit_type: string;
  current_stock: string;
  barcode: string | null;
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
  purchase: "Suma unidades al stock. Puedes indicar costo unitario para valorizar la compra.",
  adjustment: "Corrige diferencias de inventario (inventario físico, errores de carga).",
  waste: "Registra bajas por merma, vencimiento o rotura. Resta del stock.",
  return: "Entrada por devolución de cliente o nota de crédito.",
  initial_stock: "Solo para cargar el stock existente al incorporar un producto. Luego usa Compra o ajustes.",
};

export function StockMovementForm({ products, action }: StockMovementFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [movementType, setMovementType] = useState<keyof typeof movementTypeHelp>("purchase");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const quantityRef = useRef<HTMLInputElement>(null);
  const [isScanPending, startTransition] = useTransition();
  const selectedProduct = products.find((p) => p.id === productId) ?? null;
  const qty = Number(quantity || "0");
  const stockNow = selectedProduct ? Number(selectedProduct.current_stock) : 0;
  const signedDelta =
    movementType === "waste"
      ? -Math.abs(qty)
      : movementType === "purchase" || movementType === "return" || movementType === "initial_stock"
        ? Math.abs(qty)
        : qty;
  const projectedStock = stockNow + (Number.isFinite(signedDelta) ? signedDelta : 0);

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm"
    >
      <div className="space-y-1">
        <label htmlFor="productId" className="text-sm font-medium text-foreground">
          Producto
        </label>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
          <select
            id="productId"
            name="productId"
            className={cn(panelSelectClass, "min-w-0 flex-1")}
            required
            value={productId}
            onChange={(event) => {
              setProductId(event.target.value);
              setScanMessage(null);
            }}
          >
            <option value="">Seleccionar…</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} ({product.unit_type}) — stock: {product.current_stock}
              </option>
            ))}
          </select>
          <BarcodeScanButton
            className={formSecondaryButtonClass}
            disabled={isScanPending}
            label={isScanPending ? "Buscando..." : "Escanear código"}
            onDetected={(code) => {
              startTransition(async () => {
                setScanMessage(null);
                const result = await findActiveProductByBarcode(code);
                if (result.ok) {
                  setProductId(result.product.id);
                  queueMicrotask(() => quantityRef.current?.focus());
                } else {
                  setScanMessage(result.message);
                }
              });
            }}
          />
        </div>
        {scanMessage ? <p className="text-xs text-rose-600">{scanMessage}</p> : null}
        <p className="text-xs text-muted-foreground">Elige el producto afectado y verifica el stock actual en la lista.</p>
        {selectedProduct ? (
          <p className="text-xs text-muted-foreground">
            Stock actual: <span className="font-medium text-foreground">{selectedProduct.current_stock}</span>{" "}
            {selectedProduct.unit_type}
          </p>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="type" className="text-sm font-medium text-foreground">
            Tipo de movimiento
          </label>
          <select
            id="type"
            name="type"
            className={panelSelectClass}
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
          <label htmlFor="quantity" className="text-sm font-medium text-foreground">
            Cantidad
          </label>
          <input
            ref={quantityRef}
            id="quantity"
            name="quantity"
            type="number"
            step="0.0001"
            min="0"
            className={panelInputClass}
            required
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
          />
          <p className="text-xs text-muted-foreground">Usa decimales para productos a peso o por litro (ej. 0,25 kg).</p>
        </div>
      </div>

      {selectedProduct ? (
        <div className={cn("text-sm", formMutedSectionClass)}>
          <p className="font-medium text-foreground">Resumen antes de confirmar</p>
          <p className="text-muted-foreground">
            Tipo: <span className="font-medium text-foreground">{movementType}</span> · Delta:{" "}
            <span className={signedDelta < 0 ? "text-rose-600" : "text-emerald-700"}>
              {Number.isFinite(signedDelta) ? signedDelta : 0}
            </span>
          </p>
          <p className="text-muted-foreground">
            Stock proyectado:{" "}
            <span
              className={
                projectedStock < 0 ? "font-semibold text-rose-600" : "font-semibold text-foreground"
              }
            >
              {Number.isFinite(projectedStock) ? projectedStock : stockNow}
            </span>{" "}
            {selectedProduct.unit_type}
          </p>
          {projectedStock < 0 ? (
            <p className="mt-1 text-xs text-rose-600">
              El stock quedaría negativo. Ajusta cantidad o tipo de movimiento.
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="unitCost" className="text-sm font-medium text-foreground">
            Costo unitario (opcional)
          </label>
          <input
            id="unitCost"
            name="unitCost"
            type="number"
            step="0.0001"
            min="0"
            className={panelInputClass}
          />
          <p className="text-xs text-muted-foreground">Suele usarse en compras para actualizar el costo del producto.</p>
        </div>
        <div className="space-y-1">
          <label htmlFor="reason" className="text-sm font-medium text-foreground">
            Motivo
          </label>
          <input id="reason" name="reason" className={panelInputClass} />
          <p className="text-xs text-muted-foreground">Breve nota (ej. factura, remito, control de cámara).</p>
        </div>
      </div>

      <FormMessage message={state?.message} />

      <Button type="submit" disabled={pending}>
        {pending ? "Registrando..." : "Registrar movimiento"}
      </Button>
    </form>
  );
}
