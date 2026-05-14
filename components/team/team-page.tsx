import { listTeamMembers, listPendingInvitations } from "@/modules/core/team/actions";
import { InviteMemberForm } from "@/components/team/invite-member-form";
import { TeamMemberRow } from "@/components/team/team-member-row";
import { PageHeader } from "@/components/layout/page-header";
import { PendingInvitationsList } from "@/components/team/pending-invitations-list";

export async function TeamPage() {
  const [members, pendingInvites] = await Promise.all([
    listTeamMembers(),
    listPendingInvitations(),
  ]);

  return (
    <section className="space-y-6">
      <PageHeader
        title="Equipo"
        description="Gestiona los miembros de tu negocio. Solo el dueño puede invitar o eliminar empleados."
      />

      <InviteMemberForm />

      {pendingInvites.length > 0 && (
        <PendingInvitationsList invitations={pendingInvites} />
      )}

      <div className="rounded-lg border border-border bg-card text-card-foreground">
        <div className="divide-y divide-border">
          {members.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">
              No hay miembros registrados.
            </p>
          ) : (
            members.map((member) => <TeamMemberRow key={member.id} member={member} />)
          )}
        </div>
      </div>
    </section>
  );
}
