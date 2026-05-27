"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { panelInputClass } from "@/components/ui/form-field-styles";
import type { CreditActionState } from "@/modules/core/credit/actions";

const initialState: CreditActionState = {};

type CreditCustomerFormProps = {
  action: (
    prevState: CreditActionState | undefined,
    formData: FormData
  ) => Promise<CreditActionState | undefined>;
  submitLabel: string;
  defaultValues?: {
    name?: string;
    rut?: string;
    phone?: string;
    creditLimit?: number;
    notes?: string;
  };
};

export function CreditCustomerForm({ action, submitLabel, defaultValues }: CreditCustomerFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <label htmlFor="name" className="text-sm font-medium">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            name="name"
            required
            defaultValue={defaultValues?.name ?? ""}
            placeholder="Ej: Juan Pérez"
            className={panelInputClass}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="rut" className="text-sm font-medium">
            RUT
          </label>
          <input
            id="rut"
            name="rut"
            defaultValue={defaultValues?.rut ?? ""}
            placeholder="12.345.678-9"
            className={panelInputClass}
          />
          <p className="text-xs text-muted-foreground">Opcional, ayuda para cobranza.</p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="phone" className="text-sm font-medium">
            Teléfono
          </label>
          <input
            id="phone"
            name="phone"
            defaultValue={defaultValues?.phone ?? ""}
            placeholder="+56 9 XXXX XXXX"
            className={panelInputClass}
          />
          <p className="text-xs text-muted-foreground">Opcional, para contactar.</p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="creditLimit" className="text-sm font-medium">
            Límite de crédito ($) <span className="text-red-500">*</span>
          </label>
          <input
            id="creditLimit"
            name="creditLimit"
            type="number"
            min="0"
            step="100"
            defaultValue={defaultValues?.creditLimit ?? 0}
            className={panelInputClass}
          />
          <p className="text-xs text-muted-foreground">
            0 = sin crédito.
          </p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="notes" className="text-sm font-medium">
            Notas
          </label>
          <input
            id="notes"
            name="notes"
            defaultValue={defaultValues?.notes ?? ""}
            placeholder="Ej: Paga los viernes"
            className={panelInputClass}
          />
          <p className="text-xs text-muted-foreground">Opcional.</p>
        </div>
      </div>

      <FormMessage message={state?.message} />

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Guardando..." : submitLabel}
        </Button>
        <Link
          href="/fiados"
          className="inline-flex h-8 items-center justify-center rounded-lg border border-border bg-background px-3 text-sm font-medium hover:bg-muted"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
