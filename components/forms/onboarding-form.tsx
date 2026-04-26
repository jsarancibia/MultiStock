"use client";

import { useActionState } from "react";
import { createBusinessAction, type OnboardingActionState } from "@/lib/business/actions";
import { businessTypes, businessTypeValues } from "@/config/business-types";
import { Button } from "@/components/ui/button";

const initialState: OnboardingActionState = {};

export function OnboardingForm() {
  const [state, formAction, pending] = useActionState(createBusinessAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-1.5">
        <label htmlFor="name" className="text-sm font-medium">
          Nombre del negocio
        </label>
        <input
          id="name"
          name="name"
          required
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          placeholder="Ej: Mi Verduleria Central"
        />
        {state?.errors?.name?.[0] ? (
          <p className="text-sm text-destructive">{state.errors.name[0]}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Tipo de negocio</p>
        <div className="grid gap-2 sm:grid-cols-3">
          {businessTypeValues.map((type) => (
            <label
              key={type}
              className="flex cursor-pointer items-center gap-2 rounded-md border p-3 text-sm"
            >
              <input type="radio" name="businessType" value={type} required />
              <span>{businessTypes[type].label}</span>
            </label>
          ))}
        </div>
        {state?.errors?.businessType?.[0] ? (
          <p className="text-sm text-destructive">{state.errors.businessType[0]}</p>
        ) : null}
      </div>

      {state?.message ? <p className="text-sm text-destructive">{state.message}</p> : null}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Creando negocio..." : "Continuar al dashboard"}
      </Button>
    </form>
  );
}
