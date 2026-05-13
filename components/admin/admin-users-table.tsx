import { formatSystemDateTime } from "@/lib/utils";
import { PageSurface } from "@/components/ui/page-surface";
import { UserRoleSelect } from "@/components/admin/user-role-select";
import { updateUserRoleAction } from "@/modules/admin/actions";

type AdminUserRow = {
  id: string;
  email: string | null;
  role: "admin" | "user";
  created_at: string;
};

type AdminUsersTableProps = {
  users: AdminUserRow[];
};

function formatDate(value: string) {
  return formatSystemDateTime(value);
}

export function AdminUsersTable({ users }: AdminUsersTableProps) {
  return (
    <PageSurface className="overflow-x-auto p-0">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Rol</th>
            <th className="px-4 py-3">Creado</th>
            <th className="px-4 py-3">Cambiar rol</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b border-border/70 align-top">
              <td className="px-4 py-3 text-foreground">{user.email ?? "Sin email"}</td>
              <td className="px-4 py-3 text-muted-foreground">{user.role}</td>
              <td className="px-4 py-3 text-muted-foreground">{formatDate(user.created_at)}</td>
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
              <td className="px-4 py-6 text-muted-foreground" colSpan={4}>
                No hay usuarios registrados.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </PageSurface>
  );
}
