"use client";

import { useActionState } from "react";
import type { BusinessType } from "@/config/business-types";
import { Button } from "@/components/ui/button";
import { formSectionClass, panelInputClass } from "@/components/ui/form-field-styles";
import { cn } from "@/lib/utils";
import { FormMessage } from "@/components/ui/form-message";
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
    <form action={formAction} className={cn("space-y-3", formSectionClass)}>
      <h2 className="font-medium text-foreground">Nueva categoria</h2>
      <input type="hidden" name="businessType" value={businessType} />
      <input
        name="name"
        placeholder="Ej: Frutas"
        className={panelInputClass}
        required
      />
      <FormMessage message={state?.message} tone="success" className="text-xs" />
      <Button type="submit" disabled={pending} variant="outline">
        {pending ? "Guardando..." : "Agregar categoría"}
      </Button>
    </form>
  );
}
