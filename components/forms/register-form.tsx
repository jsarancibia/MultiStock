"use client";

import { useActionState } from "react";
import { authInputClass } from "@/components/auth/auth-field-styles";
import { registerAction, type AuthActionState } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";

const initialState: AuthActionState = {};

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="fullName" className="text-sm font-medium text-foreground">
          Nombre completo
        </label>
        <input
          id="fullName"
          name="fullName"
          required
          autoComplete="name"
          className={authInputClass}
          placeholder="Nombre Apellido"
        />
        <FormMessage message={state?.errors?.fullName?.[0]} />
      </div>

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
          autoComplete="new-password"
          minLength={6}
          className={authInputClass}
          placeholder="Mínimo 6 caracteres"
        />
        <FormMessage message={state?.errors?.password?.[0]} />
      </div>

      <FormMessage message={state?.message} />

      <Button
        type="submit"
        disabled={pending}
        className="h-12 w-full text-[0.9375rem] font-semibold shadow-md shadow-primary/30 transition hover:shadow-lg hover:shadow-primary/40"
      >
        {pending ? "Creando cuenta…" : "Crear cuenta gratis"}
      </Button>
    </form>
  );
}
