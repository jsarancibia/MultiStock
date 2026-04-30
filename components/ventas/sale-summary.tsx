"use client";

import { panelSelectClass } from "@/components/ui/form-field-styles";
import { paymentMethodLabels, paymentMethodValues } from "@/lib/validations/sale";
import { formatCurrency } from "@/lib/utils";

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
    <div className="space-y-3 rounded-lg border border-border bg-card p-4 text-card-foreground">
      <h2 className="font-medium text-foreground">Resumen de venta</h2>

      <div className="space-y-1">
        <label htmlFor="paymentMethod" className="text-sm font-medium text-foreground">
          Método de pago
        </label>
        <select
          id="paymentMethod"
          name="paymentMethod"
          value={paymentMethod}
          onChange={(event) =>
            onPaymentMethodChange(event.target.value as (typeof paymentMethodValues)[number])
          }
          className={panelSelectClass}
        >
          {paymentMethodValues.map((method) => (
            <option key={method} value={method}>
              {paymentMethodLabels[method]}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">
          Se guarda con la venta para el historial; puedes mezclar criterio contable fuera de MultiStock.
        </p>
      </div>

      <div className="rounded-md bg-muted/40 p-3">
        <p className="text-sm text-muted-foreground">Ítems: {itemsCount}</p>
        <p className="text-lg font-semibold">Total: {formatCurrency(total)}</p>
      </div>
    </div>
  );
}
