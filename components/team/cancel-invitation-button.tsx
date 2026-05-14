"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { cancelInvitationAction } from "@/modules/core/team/actions";
import { X } from "lucide-react";

type Props = {
  invitationId: string;
};

export function CancelInvitationButton({ invitationId }: Props) {
  const [state, formAction] = useActionState(
    async () => cancelInvitationAction(invitationId),
    undefined
  );

  return (
    <form action={formAction}>
      <Button
        type="submit"
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-amber-500 hover:text-red-600"
        title="Cancelar invitación"
      >
        <X className="h-3.5 w-3.5" />
      </Button>
      {state && (state as { message?: string }).message && (
        <p className="ml-2 text-xs text-red-500">
          {(state as { message?: string }).message}
        </p>
      )}
    </form>
  );
}
