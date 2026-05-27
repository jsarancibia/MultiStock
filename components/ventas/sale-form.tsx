"use client";

import { useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useActionState } from "react";
import type { BusinessType } from "@/config/business-types";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { FormMessage } from "@/components/ui/form-message";
import { PageNavigation } from "@/components/ui/page-navigation";
import { useBeforeUnload } from "@/lib/hooks/use-before-unload";
import { QuickProductButtons } from "@/components/ventas/quick-product-buttons";
import { ProductSearch, type SaleProductOption } from "@/components/ventas/product-search";
import { SaleItemsTable, type SaleCartItem } from "@/components/ventas/sale-items-table";
import { SaleSummary } from "@/components/ventas/sale-summary";
import { CreditCustomerSelect } from "@/components/ventas/credit-customer-select";
import type { SaleConfig } from "@/lib/business/sale-config";
import type { CreditCustomerBasic } from "@/modules/core/credit/actions";
import { allowsDecimalQuantity, exceedsStock } from "@/lib/business/unit-quantity";
import type { SaleActionState } from "@/modules/core/sales/actions";

type SaleFormProps = {
  businessType: BusinessType;
  products: SaleProductOption[];
  saleConfig: SaleConfig;
  pinnedProducts?: SaleProductOption[];
  allowMobileBarcodeLink?: boolean;
  action: (
    prevState: SaleActionState | undefined,
    formData: FormData
  ) => Promise<SaleActionState | undefined>;
  /** Ruta a la que volver. Por defecto "/ventas". */
  backHref?: string;
  /** Clientes fiado disponibles para venta a crédito */
  creditCustomers?: CreditCustomerBasic[];
  /** Si el plan permite fiado */
  allowCredit?: boolean;
};

const initialState: SaleActionState = {};

function initialSaleQuantity(product: SaleProductOption, saleConfig: SaleConfig): number {
  if (!allowsDecimalQuantity(product.unit_type)) return 1;
  const weightish = product.unit_type === "kg" || product.unit_type === "g";
  if (weightish) return Math.max(saleConfig.weightStep, 0.0001);
  return 1;
}

export function SaleForm({
  businessType,
  products,
  saleConfig,
  pinnedProducts = [],
  allowMobileBarcodeLink = true,
  action,
  backHref = "/ventas",
  creditCustomers = [],
  allowCredit = true,
}: SaleFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "debit" | "credit" | "transfer" | "other">("cash");

  function handlePaymentMethodChange(value: typeof paymentMethod) {
    setPaymentMethod(value);
    if (value !== "credit") {
      setCustomerId("");
    }
  }
  const [items, setItems] = useState<SaleCartItem[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [clientError, setClientError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [shouldPrint, setShouldPrint] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const dialogAnswered = useRef(false);
  useBeforeUnload(isDirty);

  const total = useMemo(
    () => items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0),
    [items]
  );

  function addProduct(product: SaleProductOption) {
    setClientError(null);
    setItems((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        const isWeightUnit = product.unit_type === "kg" || product.unit_type === "g";
        const step = isWeightUnit ? saleConfig.weightStep : 1;
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
          quantity: initialSaleQuantity(product, saleConfig),
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
      if (!allowsDecimalQuantity(item.unitType) && !Number.isInteger(item.quantity)) {
        setClientError(`${item.name} solo admite cantidades enteras.`);
        return false;
      }
      if (exceedsStock(item.quantity, item.stock)) {
        setClientError(`Stock insuficiente para ${item.name}.`);
        return false;
      }
      if (item.unitPrice < 0 || !Number.isFinite(item.unitPrice)) {
        setClientError(`Precio unitario invalido para ${item.name}.`);
        return false;
      }
    }

    if (paymentMethod === "credit" && !customerId) {
      setClientError("Selecciona un cliente fiado para la venta a crédito.");
      return false;
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
    <div className="space-y-6">
      <PageNavigation backHref={backHref} />

      <form
        ref={formRef}
        action={formAction}
        onSubmit={(event) => {
          if (!validateBeforeSubmit()) {
            event.preventDefault();
            return;
          }
          if (!dialogAnswered.current) {
            event.preventDefault();
            setShowPrintDialog(true);
            return;
          }
        }}
        onChange={() => setIsDirty(true)}
        className="space-y-4"
      >
        <input type="hidden" name="paymentMethod" value={paymentMethod} />
        <input type="hidden" name="items" value={payload} />
        <input type="hidden" name="shouldPrint" value={shouldPrint ? "1" : "0"} />
        <input type="hidden" name="creditCustomerId" value={customerId} />

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {saleConfig.showQuickButtons ? (
              pinnedProducts.length > 0 ? (
                <QuickProductButtons products={pinnedProducts} onAdd={addProduct} />
              ) : (
                <div className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-5 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">Sin accesos rápidos configurados</p>
                  <p className="mt-1 text-xs">
                    En la ficha de cada producto podés activar{" "}
                    <span className="font-medium text-foreground">Acceso rápido en ventas</span> para que
                    aparezca aquí como botón directo.
                  </p>
                </div>
              )
            ) : null}
            <ProductSearch
              businessType={businessType}
              products={products}
              onAddProduct={addProduct}
              allowMobileBarcodeLink={allowMobileBarcodeLink}
              searchPlaceholder={saleConfig.searchPlaceholder}
              searchAutoFocus={saleConfig.searchAutoFocus}
              quantityHint={saleConfig.quantityHint}
            />
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
                onPaymentMethodChange={handlePaymentMethodChange}
                allowCredit={allowCredit}
              />

              {paymentMethod === "credit" && (
                <CreditCustomerSelect
                  customers={creditCustomers}
                  value={customerId}
                  onChange={setCustomerId}
                />
              )}

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

      <ConfirmDialog
        open={showPrintDialog}
        onOpenChange={(open) => {
          if (!open) setShowPrintDialog(false);
        }}
        title="¿Desea imprimir boleta?"
        description="Puede imprimir la boleta ahora o hacerlo después desde el detalle de la venta."
        confirmLabel="Sí, imprimir"
        cancelLabel="No, solo confirmar"
        variant="default"
        onConfirm={() => {
          flushSync(() => {
            setShouldPrint(true);
            setShowPrintDialog(false);
          });
          dialogAnswered.current = true;
          formRef.current?.requestSubmit();
        }}
        onCancel={() => {
          flushSync(() => {
            setShouldPrint(false);
            setShowPrintDialog(false);
          });
          dialogAnswered.current = true;
          formRef.current?.requestSubmit();
        }}
      />
    </div>
  );
}
