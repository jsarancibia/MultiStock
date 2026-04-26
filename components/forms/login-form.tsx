"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, type AuthActionState } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";

const initialState: AuthActionState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
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
          placeholder="******"
        />
        {state?.errors?.password?.[0] ? (
          <p className="text-sm text-destructive">{state.errors.password[0]}</p>
        ) : null}
      </div>

      {state?.message ? <p className="text-sm text-destructive">{state.message}</p> : null}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Ingresando..." : "Ingresar"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        No tienes cuenta?{" "}
        <Link href="/auth/register" className="underline underline-offset-4">
          Registrate
        </Link>
      </p>
    </form>
  );
}
