"use client";

import { paymentMethodLabels, paymentMethodValues } from "@/lib/validations/sale";

type SaleSummaryProps = {
  paymentMethod: (typeof paymentMethodValues)[number];
  total: number;
  itemsCount: number;
  onPaymentMethodChange: (value: (typeof paymentMethodValues)[number]) => void;
};

export function SaleSummary({
  paymentMethod,
  total,
  itemsCount,
  onPaymentMethodChange,
}: SaleSummaryProps) {
  return (
    <div className="space-y-3 rounded-lg border p-4">
      <h2 className="font-medium">Resumen de venta</h2>

      <div className="space-y-1">
        <label htmlFor="paymentMethod" className="text-sm font-medium">
          Metodo de pago
        </label>
        <select
          id="paymentMethod"
          name="paymentMethod"
          value={paymentMethod}
          onChange={(event) =>
            onPaymentMethodChange(event.target.value as (typeof paymentMethodValues)[number])
          }
          className="w-full rounded-md border px-3 py-2 text-sm"
        >
          {paymentMethodValues.map((method) => (
            <option key={method} value={method}>
              {paymentMethodLabels[method]}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-md bg-muted/40 p-3">
        <p className="text-sm text-muted-foreground">Items: {itemsCount}</p>
        <p className="text-lg font-semibold">Total: ${total.toFixed(2)}</p>
      </div>
    </div>
  );
}
