"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { inviteMemberAction } from "@/modules/core/team/actions";
import { Plus, Loader2 } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Plus className="h-4 w-4" />
      )}
      Agregar
    </Button>
  );
}

export function InviteMemberForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const wrappedAction = async (_prevState: unknown, formData: FormData) => {
    return inviteMemberAction(formData);
  };
  const [state, formAction] = useActionState(wrappedAction, undefined);
  const [showForm, setShowForm] = useState(false);

  // Cuando la invitación es exitosa, cerrar formulario y refrescar
  useEffect(() => {
    if (state?.success) {
      setShowForm(false);
      formRef.current?.reset();
      router.refresh();
    }
  }, [state, router]);

  if (!showForm) {
    return (
      <Button variant="outline" onClick={() => setShowForm(true)}>
        <Plus className="h-4 w-4" />
        Invitar empleado
      </Button>
    );
  }

  return (
    <>
      <form ref={formRef} action={formAction} className="rounded-lg border border-border bg-card p-4 text-card-foreground">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label htmlFor="email" className="mb-1 block text-sm font-medium">
              Email del empleado
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="correo@ejemplo.com"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <SubmitButton />
          <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
            Cancelar
          </Button>
        </div>
        {state?.message && !state.success && (
          <p className="mt-2 text-sm text-red-600">{state.message}</p>
        )}
      </form>
      {state?.message && state.success && state.registerUrl && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          <p className="mb-2 font-medium">Invitación registrada</p>
          <p className="mb-1">
            El empleado debe registrarse en el siguiente enlace para unirse al negocio:
          </p>
          <a
            href={state.registerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block break-all rounded bg-white px-3 py-1.5 text-blue-600 underline hover:text-blue-800"
          >
            {state.registerUrl}
          </a>
        </div>
      )}
    </>
  );
}
