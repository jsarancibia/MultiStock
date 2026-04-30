"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { panelInputClass } from "@/components/ui/form-field-styles";
import { FormMessage } from "@/components/ui/form-message";
import type { SupplierActionState } from "@/modules/core/suppliers/actions";

const initialState: SupplierActionState = {};

type SupplierLike = {
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
};

type SupplierFormProps = {
  action: (
    prevState: SupplierActionState | undefined,
    formData: FormData
  ) => Promise<SupplierActionState | undefined>;
  submitLabel: string;
  initialSupplier?: SupplierLike | null;
};

export function SupplierForm({ action, submitLabel, initialSupplier }: SupplierFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="name" className="text-sm font-medium text-foreground">
          Nombre
        </label>
        <input
          id="name"
          name="name"
          className={panelInputClass}
          defaultValue={initialSupplier?.name ?? ""}
          required
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="phone" className="text-sm font-medium text-foreground">
            Telefono
          </label>
          <input id="phone" name="phone" className={panelInputClass} defaultValue={initialSupplier?.phone ?? ""} />
        </div>
        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            Email
          </label>
          <input id="email" name="email" type="email" className={panelInputClass} defaultValue={initialSupplier?.email ?? ""} />
        </div>
      </div>
      <div className="space-y-1">
        <label htmlFor="address" className="text-sm font-medium text-foreground">
          Direccion
        </label>
        <input id="address" name="address" className={panelInputClass} defaultValue={initialSupplier?.address ?? ""} />
      </div>
      <FormMessage message={state?.message} />
      <Button type="submit" disabled={pending}>
        {pending ? "Guardando..." : submitLabel}
      </Button>
    </form>
  );
}
