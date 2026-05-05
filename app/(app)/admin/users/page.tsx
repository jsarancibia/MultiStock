import { AdminUsersTable } from "@/components/admin/admin-users-table";
import { getUsers } from "@/modules/admin/actions";

export default async function AdminUsersPage() {
  const users = await getUsers();

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <p className="text-sm text-muted-foreground">Administración global</p>
        <h1 className="text-2xl font-semibold text-foreground">Usuarios</h1>
      </header>
      <AdminUsersTable users={users} />
    </section>
  );
}
