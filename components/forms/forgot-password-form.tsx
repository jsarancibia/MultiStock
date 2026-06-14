"use client";

import { useActionState } from "react";
import { authInputClass } from "@/components/auth/auth-field-styles";
import { resetPasswordAction, type AuthActionState } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";

const initialState: AuthActionState = {};

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(resetPasswordAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium text-foreground">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={authInputClass}
          placeholder="tu@email.com"
        />
        <FormMessage message={state?.errors?.email?.[0]} />
      </div>

      <FormMessage message={state?.message} tone={state?.tone} />

      <Button
        type="submit"
        disabled={pending}
        className="h-12 w-full text-[0.9375rem] font-semibold shadow-md shadow-primary/30 transition hover:shadow-lg hover:shadow-primary/40"
      >
        {pending ? "Enviando…" : "Enviar enlace de recuperacion"}
      </Button>
    </form>
  );
}
