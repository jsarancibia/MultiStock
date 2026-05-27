"use client";

import { useActionState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { panelInputClass, panelSelectClass } from "@/components/ui/form-field-styles";
import { registerPaymentAction, type CreditActionState } from "@/modules/core/credit/actions";

const initialState: CreditActionState = {};

type PaymentFormProps = {
  customerId: string;
  currentBalance: number;
};

export function PaymentForm({ customerId, currentBalance }: PaymentFormProps) {
  const [state, formAction, pending] = useActionState(registerPaymentAction, initialState);
  const amountRef = useRef<HTMLInputElement>(null);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="customerId" value={customerId} />

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1">
          <label htmlFor="amount" className="text-sm font-medium">
            Monto ($) <span className="text-red-500">*</span>
          </label>
          <input
            ref={amountRef}
            id="amount"
            name="amount"
            type="number"
            min="1"
            step="1"
            max={currentBalance}
            required
            placeholder={`Debe $${currentBalance.toLocaleString("es-CL")}`}
            className={panelInputClass}
          />
          <button
            type="button"
            className="text-xs text-primary underline mt-1"
            onClick={() => {
              if (amountRef.current) {
                amountRef.current.value = String(currentBalance);
              }
            }}
          >
            Pagar deuda completa (${currentBalance.toLocaleString("es-CL")})
          </button>
        </div>

        <div className="space-y-1">
          <label htmlFor="paymentMethod" className="text-sm font-medium">
            Método de pago <span className="text-red-500">*</span>
          </label>
          <select id="paymentMethod" name="paymentMethod" required className={panelSelectClass}>
            <option value="">Seleccionar...</option>
            <option value="efectivo">Efectivo</option>
            <option value="debito">Débito</option>
            <option value="credito">Crédito</option>
            <option value="transferencia">Transferencia</option>
            <option value="otro">Otro</option>
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="description" className="text-sm font-medium">
            Descripción
          </label>
          <input
            id="description"
            name="description"
            placeholder="Opcional"
            className={panelInputClass}
          />
        </div>
      </div>

      <FormMessage message={state?.message} />

      <Button type="submit" disabled={pending}>
        {pending ? "Registrando..." : "Registrar pago"}
      </Button>
    </form>
  );
}
