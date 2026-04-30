"use client";

import { useActionState } from "react";
import { authInputClass } from "@/components/auth/auth-field-styles";
import { loginAction, type AuthActionState } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";

const initialState: AuthActionState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

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

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-medium text-foreground">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={authInputClass}
          placeholder="••••••"
        />
        <FormMessage message={state?.errors?.password?.[0]} />
      </div>

      <FormMessage message={state?.message} />

      <Button
        type="submit"
        disabled={pending}
        className="h-12 w-full text-[0.9375rem] font-semibold shadow-md shadow-primary/30 transition hover:shadow-lg hover:shadow-primary/40"
      >
        {pending ? "Ingresando…" : "Ingresar al panel"}
      </Button>
    </form>
  );
}
