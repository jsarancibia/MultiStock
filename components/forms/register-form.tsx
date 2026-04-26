"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerAction, type AuthActionState } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";

const initialState: AuthActionState = {};

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="fullName" className="text-sm font-medium">
          Nombre completo
        </label>
        <input
          id="fullName"
          name="fullName"
          required
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          placeholder="Nombre Apellido"
        />
        {state?.errors?.fullName?.[0] ? (
          <p className="text-sm text-destructive">{state.errors.fullName[0]}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          placeholder="tu@email.com"
        />
        {state?.errors?.email?.[0] ? (
          <p className="text-sm text-destructive">{state.errors.email[0]}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-medium">
          Contrasena
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          placeholder="Minimo 6 caracteres"
        />
        {state?.errors?.password?.[0] ? (
          <p className="text-sm text-destructive">{state.errors.password[0]}</p>
        ) : null}
      </div>

      {state?.message ? <p className="text-sm text-destructive">{state.message}</p> : null}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Creando cuenta..." : "Crear cuenta"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Ya tienes cuenta?{" "}
        <Link href="/auth/login" className="underline underline-offset-4">
          Inicia sesion
        </Link>
      </p>
    </form>
  );
}
