"use client";

import { panelSelectClass } from "@/components/ui/form-field-styles";
import { paymentMethodLabels, paymentMethodValues } from "@/lib/validations/sale";
import { formatCurrency } from "@/lib/utils";

type SaleSummaryProps = {
  paymentMethod: (typeof paymentMethodValues)[number];
  total: number;
  itemsCount: number;
  onPaymentMethodChange: (value: (typeof paymentMethodValues)[number]) => void;
  allowCredit?: boolean;
  shouldPrint?: boolean;
  onShouldPrintChange?: (value: boolean) => void;
  creditCustomerName?: string;
  creditCustomerBalance?: number;
  creditCustomerLimit?: number;
};

const paymentMethodOptions = paymentMethodValues.map((v) => ({
  value: v,
  label: paymentMethodLabels[v],
}));

export function SaleSummary({
  paymentMethod,
  total,
  itemsCount,
  onPaymentMethodChange,
  allowCredit = true,
  shouldPrint,
  onShouldPrintChange,
  creditCustomerName,
  creditCustomerBalance,
  creditCustomerLimit,
}: SaleSummaryProps) {
  const options = allowCredit
    ? paymentMethodOptions
    : paymentMethodOptions.filter((o) => o.value !== "fiado");

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
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">
          Confirma solo cuando revises total y cantidades.
        </p>
      </div>

      <div className="rounded-md bg-muted/40 p-3">
        <p className="text-sm text-muted-foreground">Ítems: {itemsCount}</p>
        <p className="text-lg font-semibold">Total: {formatCurrency(total)}</p>
        {creditCustomerName && (
          <div className="mt-2 border-t border-border pt-2 space-y-0.5">
            <p className="text-xs text-muted-foreground">Cliente: <span className="font-medium text-foreground">{creditCustomerName}</span></p>
            {creditCustomerBalance !== undefined && (
              <p className="text-xs text-muted-foreground">Deuda actual: <span className="font-medium text-foreground">{formatCurrency(creditCustomerBalance)}</span></p>
            )}
            {creditCustomerLimit !== undefined && creditCustomerLimit > 0 && (
              <p className="text-xs text-muted-foreground">
                Disponible: <span className="font-medium text-foreground">{formatCurrency(Math.max(0, creditCustomerLimit - creditCustomerBalance! - total))}</span>
              </p>
            )}
          </div>
        )}
      </div>

      {onShouldPrintChange !== undefined && (
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={shouldPrint}
            onChange={(e) => onShouldPrintChange(e.target.checked)}
            className="rounded border-input"
          />
          Imprimir boleta al confirmar
        </label>
      )}
    </div>
  );
}
