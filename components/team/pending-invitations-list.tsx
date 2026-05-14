import { cancelInvitationAction, type PendingInvitation } from "@/modules/core/team/actions";
import { CancelInvitationButton } from "@/components/team/cancel-invitation-button";

type Props = {
  invitations: PendingInvitation[];
};

export function PendingInvitationsList({ invitations }: Props) {
  return (
    <div className="rounded-lg border border-dashed border-amber-300 bg-amber-50/50 text-card-foreground dark:border-amber-800 dark:bg-amber-950/10">
      <div className="border-b border-dashed border-amber-300/50 px-4 py-2 text-sm font-medium text-amber-800 dark:border-amber-800/50 dark:text-amber-200">
        Invitaciones pendientes
      </div>
      <div className="divide-y divide-dashed divide-amber-200/50 dark:divide-amber-900/30">
        {invitations.map((inv) => (
          <div key={inv.id} className="flex items-center justify-between px-4 py-3">
            <div className="flex-1">
              <p className="text-sm text-amber-900 dark:text-amber-100">{inv.email}</p>
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Pendiente de registro
              </p>
            </div>
            <CancelInvitationButton invitationId={inv.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
