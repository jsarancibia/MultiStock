"use client";

import { useActionState, useEffect, useRef } from "react";
import { authInputClass } from "@/components/auth/auth-field-styles";
import { changePasswordAction, type AuthActionState } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";

const initialState: AuthActionState = {};

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(changePasswordAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.tone === "success") {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="currentPassword" className="text-sm font-medium text-foreground">
          Contrasena actual
        </label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          required
          autoComplete="current-password"
          className={authInputClass}
          placeholder="••••••"
        />
        <FormMessage message={state?.errors?.currentPassword?.[0]} />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="newPassword" className="text-sm font-medium text-foreground">
          Nueva contrasena
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          required
          autoComplete="new-password"
          className={authInputClass}
          placeholder="••••••"
        />
        <FormMessage message={state?.errors?.newPassword?.[0]} />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="confirmNewPassword" className="text-sm font-medium text-foreground">
          Confirmar nueva contrasena
        </label>
        <input
          id="confirmNewPassword"
          name="confirmNewPassword"
          type="password"
          required
          autoComplete="new-password"
          className={authInputClass}
          placeholder="••••••"
        />
        <FormMessage message={state?.errors?.confirmNewPassword?.[0]} />
      </div>

      <FormMessage message={state?.message} tone={state?.tone} />

      <Button
        type="submit"
        disabled={pending}
        className="h-12 w-full text-[0.9375rem] font-semibold shadow-md shadow-primary/30 transition hover:shadow-lg hover:shadow-primary/40"
      >
        {pending ? "Actualizando…" : "Cambiar contrasena"}
      </Button>
    </form>
  );
}
