"use client";

import { useActionState, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { removeMemberAction } from "@/modules/core/team/actions";
import { Trash2 } from "lucide-react";
import type { TeamMember } from "@/modules/core/team/actions";

type Props = {
  member: TeamMember;
};

export function TeamMemberRow({ member }: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(
    async (_prev: unknown) => removeMemberAction(member.user_id),
    undefined
  );

  const roleLabel =
    member.role === "owner"
      ? "Dueño"
      : "Empleado";

  const isOwner = member.role === "owner";

  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex-1">
        <p className="text-sm font-medium">
          {member.profiles?.full_name ?? "Sin nombre"}
        </p>
        <p className="text-xs text-muted-foreground">
          {member.profiles?.email ?? "Sin email"}
        </p>
        <span className="mt-1 inline-block rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
          {roleLabel}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {!isOwner && (
          <form ref={formRef} action={formAction}>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-red-600"
              onClick={() => setConfirmOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </form>
        )}
        {state && !isOwner && (
          <p
            className={`text-xs ${(state as { success?: boolean }).success ? "text-green-600" : "text-red-600"}`}
          >
            {(state as { message?: string }).message}
          </p>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Eliminar miembro"
        description={`¿Estás seguro de eliminar a ${member.profiles?.full_name ?? "este miembro"} del equipo? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        variant="destructive"
        onConfirm={() => {
          formRef.current?.requestSubmit();
        }}
      />
    </div>
  );
}
