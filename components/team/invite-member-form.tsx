"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { inviteMemberAction } from "@/modules/core/team/actions";
import { ShareInviteModal } from "@/components/team/share-invite-modal";
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
  const [invitedEmail, setInvitedEmail] = useState<string | null>(null);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const wrappedAction = async (_prevState: unknown, formData: FormData) => {
    return inviteMemberAction(formData);
  };
  const [state, formAction] = useActionState(wrappedAction, undefined);
  const [showForm, setShowForm] = useState(false);

  // Cuando la invitación es exitosa, abrir modal de compartir
  useEffect(() => {
    if (state?.success && state.registerUrl) {
      const email = formRef.current ? (new FormData(formRef.current).get("email") as string) : "";
      setInvitedEmail(email);
      setInviteUrl(state.registerUrl);
      setShowShareModal(true);
      setShowForm(false);
      formRef.current?.reset();
      router.refresh();
    }
  }, [state, router]);

  if (!showForm) {
    return (
      <>
        <Button variant="outline" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />
          Invitar empleado
        </Button>
        {inviteUrl && invitedEmail && (
          <ShareInviteModal
            open={showShareModal}
            onOpenChange={setShowShareModal}
            email={invitedEmail}
            registerUrl={inviteUrl}
          />
        )}
      </>
    );
  }

  return (
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
  );
}
