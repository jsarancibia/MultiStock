import Link from "next/link";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { PageSurface } from "@/components/ui/page-surface";
import { getAdminDashboard } from "@/modules/admin/actions";

function formatDate(value: string) {
  return new Date(value).toLocaleString("es-CL");
}

export default async function AdminPage() {
  const dashboard = await getAdminDashboard();

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <p className="text-sm text-muted-foreground">Administración global</p>
        <h1 className="text-2xl font-semibold text-foreground">Panel admin</h1>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard label="Total usuarios" value={dashboard.totalUsers} />
        <AdminStatCard label="Total negocios" value={dashboard.totalBusinesses} />
        <AdminStatCard label="Plan Free" value={dashboard.usersByPlan.free} />
        <AdminStatCard label="Plan Pro + Business" value={dashboard.usersByPlan.pro + dashboard.usersByPlan.business} />
      </div>

      <PageSurface className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-foreground">Últimos registros</h2>
          <div className="flex gap-3 text-sm">
            <Link className="text-primary hover:underline" href="/admin/users">
              Ver usuarios
            </Link>
            <Link className="text-primary hover:underline" href="/admin/businesses">
              Ver negocios
            </Link>
          </div>
        </div>
        <ul className="space-y-2 text-sm">
          {dashboard.recentUsers.map((user) => (
            <li key={user.id} className="rounded-lg border border-border px-3 py-2 text-muted-foreground">
              <span className="font-medium text-foreground">{user.email ?? "Sin email"}</span>{" "}
              - {user.role} / {user.plan} - {formatDate(user.created_at)}
            </li>
          ))}
          {dashboard.recentUsers.length === 0 ? (
            <li className="rounded-lg border border-border px-3 py-2 text-muted-foreground">
              No hay registros recientes.
            </li>
          ) : null}
        </ul>
      </PageSurface>
    </section>
  );
}
