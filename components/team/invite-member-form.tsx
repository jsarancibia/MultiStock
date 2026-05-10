"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
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
  const [state, formAction] = useActionState(inviteMemberAction, undefined);
  const [showForm, setShowForm] = useState(false);

  if (!showForm) {
    return (
      <Button variant="outline" onClick={() => setShowForm(true)}>
        <Plus className="h-4 w-4" />
        Invitar empleado
      </Button>
    );
  }

  return (
    <form action={formAction} className="rounded-lg border border-border bg-card p-4 text-card-foreground">
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
      {state?.message && (
        <p className={`mt-2 text-sm ${state.success ? "text-green-600" : "text-red-600"}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}
