"use client";

import { useActionState } from "react";
import { authInputClass } from "@/components/auth/auth-field-styles";
import { updatePasswordAction, type AuthActionState } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";

const initialState: AuthActionState = {};

export function UpdatePasswordForm() {
  const [state, formAction, pending] = useActionState(updatePasswordAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-medium text-foreground">
          Nueva contrasena
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          className={authInputClass}
          placeholder="••••••"
        />
        <FormMessage message={state?.errors?.password?.[0]} />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
          Confirmar contrasena
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          autoComplete="new-password"
          className={authInputClass}
          placeholder="••••••"
        />
        <FormMessage message={state?.errors?.confirmPassword?.[0]} />
      </div>

      <FormMessage message={state?.message} tone={state?.tone} />

      <Button
        type="submit"
        disabled={pending}
        className="h-12 w-full text-[0.9375rem] font-semibold shadow-md shadow-primary/30 transition hover:shadow-lg hover:shadow-primary/40"
      >
        {pending ? "Actualizando…" : "Actualizar contrasena"}
      </Button>
    </form>
  );
}
