"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { panelInputClass, panelSelectClass } from "@/components/ui/form-field-styles";
import { registerPaymentAction, type CreditActionState } from "@/modules/core/credit/actions";

const initialState: CreditActionState = {};

type PaymentFormProps = {
  customerId: string;
};

export function PaymentForm({ customerId }: PaymentFormProps) {
  const [state, formAction, pending] = useActionState(registerPaymentAction, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="customerId" value={customerId} />

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1">
          <label htmlFor="amount" className="text-sm font-medium">
            Monto ($) <span className="text-red-500">*</span>
          </label>
          <input
            id="amount"
            name="amount"
            type="number"
            min="1"
            step="100"
            required
            placeholder="0"
            className={panelInputClass}
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="paymentMethod" className="text-sm font-medium">
            Método de pago <span className="text-red-500">*</span>
          </label>
          <select id="paymentMethod" name="paymentMethod" required className={panelSelectClass}>
            <option value="">Seleccionar...</option>
            <option value="cash">Efectivo</option>
            <option value="transfer">Transferencia</option>
            <option value="mercado_pago">Mercado Pago</option>
            <option value="khipu">Khipu</option>
            <option value="other">Otro</option>
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
