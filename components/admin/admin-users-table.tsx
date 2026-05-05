import { PageSurface } from "@/components/ui/page-surface";
import { UserPlanSelect } from "@/components/admin/user-plan-select";
import { UserRoleSelect } from "@/components/admin/user-role-select";
import { updateUserPlanAction, updateUserRoleAction } from "@/modules/admin/actions";

type AdminUserRow = {
  id: string;
  email: string | null;
  role: "admin" | "user";
  plan: "free" | "pro" | "business";
  created_at: string;
};

type AdminUsersTableProps = {
  users: AdminUserRow[];
};

function formatDate(value: string) {
  return new Date(value).toLocaleString("es-CL");
}

export function AdminUsersTable({ users }: AdminUsersTableProps) {
  return (
    <PageSurface className="overflow-x-auto p-0">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Plan</th>
            <th className="px-4 py-3">Rol</th>
            <th className="px-4 py-3">Creado</th>
            <th className="px-4 py-3">Cambiar plan</th>
            <th className="px-4 py-3">Cambiar rol</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b border-border/70 align-top">
              <td className="px-4 py-3 text-foreground">{user.email ?? "Sin email"}</td>
              <td className="px-4 py-3 text-muted-foreground">{user.plan}</td>
              <td className="px-4 py-3 text-muted-foreground">{user.role}</td>
              <td className="px-4 py-3 text-muted-foreground">{formatDate(user.created_at)}</td>
              <td className="px-4 py-3">
                <UserPlanSelect
                  userId={user.id}
                  currentPlan={user.plan}
                  action={updateUserPlanAction}
                />
              </td>
              <td className="px-4 py-3">
                <UserRoleSelect
                  userId={user.id}
                  currentRole={user.role}
                  action={updateUserRoleAction}
                />
              </td>
            </tr>
          ))}
          {users.length === 0 ? (
            <tr>
              <td className="px-4 py-6 text-muted-foreground" colSpan={6}>
                No hay usuarios registrados.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </PageSurface>
  );
}
