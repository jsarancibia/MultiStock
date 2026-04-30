"use client";

import { useMemo, useState } from "react";
import { useActionState } from "react";
import type { BusinessType } from "@/config/business-types";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { ProductSearch, type SaleProductOption } from "@/components/ventas/product-search";
import { SaleItemsTable, type SaleCartItem } from "@/components/ventas/sale-items-table";
import { SaleSummary } from "@/components/ventas/sale-summary";
import type { SaleActionState } from "@/modules/core/sales/actions";

type SaleFormProps = {
  businessType: BusinessType;
  products: SaleProductOption[];
  action: (
    prevState: SaleActionState | undefined,
    formData: FormData
  ) => Promise<SaleActionState | undefined>;
};

const initialState: SaleActionState = {};
const DECIMAL_UNITS = new Set(["kg", "g", "liter", "meter"]);

export function SaleForm({ businessType, products, action }: SaleFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "debit" | "credit" | "transfer" | "other">("cash");
  const [items, setItems] = useState<SaleCartItem[]>([]);
  const [clientError, setClientError] = useState<string | null>(null);

  const total = useMemo(
    () => items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0),
    [items]
  );

  function addProduct(product: SaleProductOption) {
    setClientError(null);
    setItems((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        const step =
          businessType === "verduleria" && (product.unit_type === "kg" || product.unit_type === "g")
            ? 0.5
            : 1;
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + step }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          unitType: product.unit_type,
          stock: Number(product.current_stock),
          quantity: 1,
          unitPrice: Number(product.sale_price),
        },
      ];
    });
  }

  function updateQuantity(productId: string, quantity: number) {
    setClientError(null);
    setItems((prev) =>
      prev.map((item) => {
        if (item.productId !== productId) return item;
        return { ...item, quantity: Number.isFinite(quantity) ? quantity : item.quantity };
      })
    );
  }

  function updateUnitPrice(productId: string, unitPrice: number) {
    setClientError(null);
    setItems((prev) =>
      prev.map((item) => {
        if (item.productId !== productId) return item;
        return { ...item, unitPrice: Number.isFinite(unitPrice) ? unitPrice : item.unitPrice };
      })
    );
  }

  function removeItem(productId: string) {
    setClientError(null);
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  }

  function validateBeforeSubmit() {
    if (!items.length) {
      setClientError("Debes agregar al menos un producto.");
      return false;
    }

    for (const item of items) {
      if (item.quantity <= 0 || !Number.isFinite(item.quantity)) {
        setClientError(`Cantidad invalida para ${item.name}.`);
        return false;
      }
      if (!DECIMAL_UNITS.has(item.unitType) && !Number.isInteger(item.quantity)) {
        setClientError(`${item.name} solo admite cantidades enteras.`);
        return false;
      }
      if (item.quantity > item.stock) {
        setClientError(`Stock insuficiente para ${item.name}.`);
        return false;
      }
      if (item.unitPrice < 0 || !Number.isFinite(item.unitPrice)) {
        setClientError(`Precio unitario invalido para ${item.name}.`);
        return false;
      }
    }

    setClientError(null);
    return true;
  }

  const payload = JSON.stringify(
    items.map((item) => ({
      productId: item.productId,
      quantity: Number(item.quantity.toFixed(4)),
      unitPrice: Number(item.unitPrice.toFixed(4)),
    }))
  );

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!validateBeforeSubmit()) {
          event.preventDefault();
        }
      }}
      className="space-y-4"
    >
      <input type="hidden" name="paymentMethod" value={paymentMethod} />
      <input type="hidden" name="items" value={payload} />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <ProductSearch businessType={businessType} products={products} onAddProduct={addProduct} />
          <SaleItemsTable
            items={items}
            onUpdateQuantity={updateQuantity}
            onUpdateUnitPrice={updateUnitPrice}
            onRemove={removeItem}
          />
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="space-y-3 rounded-xl border border-border bg-card p-3 text-card-foreground shadow-sm">
            <SaleSummary
              paymentMethod={paymentMethod}
              total={total}
              itemsCount={items.length}
              onPaymentMethodChange={setPaymentMethod}
            />
            <FormMessage message={clientError} />
            <FormMessage message={state?.message} />
            <Button className="w-full" type="submit" disabled={pending || !items.length}>
              {pending ? "Confirmando venta..." : "Confirmar venta"}
            </Button>
            <p className="text-xs text-muted-foreground">
              Confirma solo cuando revises total, método de pago y cantidades.
            </p>
          </div>
        </aside>
      </div>
    </form>
  );
}
