"use client";

import { useActionState } from "react";
import type { BusinessType } from "@/config/business-types";
import { Button } from "@/components/ui/button";
import type { CategoryActionState } from "@/modules/core/categories/actions";

const initialState: CategoryActionState = {};

type CategoryFormProps = {
  businessType: BusinessType;
  action: (
    prevState: CategoryActionState | undefined,
    formData: FormData
  ) => Promise<CategoryActionState | undefined>;
};

export function CategoryForm({ businessType, action }: CategoryFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-3 rounded-lg border p-4">
      <h2 className="font-medium">Nueva categoria</h2>
      <input type="hidden" name="businessType" value={businessType} />
      <input name="name" placeholder="Ej: Frutas" className="w-full rounded-md border px-3 py-2 text-sm" required />
      {state?.message ? <p className="text-xs text-emerald-600">{state.message}</p> : null}
      <Button type="submit" disabled={pending} variant="outline">
        {pending ? "Guardando..." : "Agregar categoria"}
      </Button>
    </form>
  );
}
