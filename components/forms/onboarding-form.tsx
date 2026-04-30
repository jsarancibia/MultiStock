"use client";

import { useActionState } from "react";
import { createBusinessAction, type OnboardingActionState } from "@/lib/business/actions";
import { businessTypes, businessTypeValues } from "@/config/business-types";
import { Button } from "@/components/ui/button";
import { panelInputClass } from "@/components/ui/form-field-styles";
import { FormMessage } from "@/components/ui/form-message";

const initialState: OnboardingActionState = {};

export function OnboardingForm() {
  const [state, formAction, pending] = useActionState(createBusinessAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-1.5">
        <label htmlFor="name" className="text-sm font-medium text-foreground">
          Nombre del negocio
        </label>
        <input
          id="name"
          name="name"
          required
          className={panelInputClass}
          placeholder="Ej: Mi Verduleria Central"
        />
        <FormMessage message={state?.errors?.name?.[0]} />
        <p className="text-xs text-muted-foreground">Ejemplo: Kiosco Centro, Verdulería San Martín, Ferretería Norte.</p>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Tipo de negocio</p>
        <div className="grid gap-2 sm:grid-cols-3">
          {businessTypeValues.map((type) => (
            <label
              key={type}
              className="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-card p-3 text-sm text-foreground hover:bg-muted/50"
            >
              <input type="radio" name="businessType" value={type} required />
              <span>{businessTypes[type].label}</span>
            </label>
          ))}
        </div>
        <FormMessage message={state?.errors?.businessType?.[0]} />
      </div>

      <FormMessage message={state?.message} />

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Creando negocio..." : "Crear negocio y continuar"}
      </Button>
    </form>
  );
}
