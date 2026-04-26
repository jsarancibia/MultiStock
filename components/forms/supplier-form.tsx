"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
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
        <label htmlFor="name" className="text-sm font-medium">
          Nombre
        </label>
        <input id="name" name="name" className="w-full rounded-md border px-3 py-2 text-sm" defaultValue={initialSupplier?.name ?? ""} required />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="phone" className="text-sm font-medium">
            Telefono
          </label>
          <input id="phone" name="phone" className="w-full rounded-md border px-3 py-2 text-sm" defaultValue={initialSupplier?.phone ?? ""} />
        </div>
        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input id="email" name="email" type="email" className="w-full rounded-md border px-3 py-2 text-sm" defaultValue={initialSupplier?.email ?? ""} />
        </div>
      </div>
      <div className="space-y-1">
        <label htmlFor="address" className="text-sm font-medium">
          Direccion
        </label>
        <input id="address" name="address" className="w-full rounded-md border px-3 py-2 text-sm" defaultValue={initialSupplier?.address ?? ""} />
      </div>
      {state?.message ? <p className="text-sm text-destructive">{state.message}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Guardando..." : submitLabel}
      </Button>
    </form>
  );
}
