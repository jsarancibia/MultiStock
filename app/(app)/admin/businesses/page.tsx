import { AdminBusinessesTable } from "@/components/admin/admin-businesses-table";
import { getBusinesses } from "@/modules/admin/actions";

export default async function AdminBusinessesPage() {
  const businesses = await getBusinesses();

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <p className="text-sm text-muted-foreground">Administración global</p>
        <h1 className="text-2xl font-semibold text-foreground">Negocios</h1>
      </header>
      <AdminBusinessesTable businesses={businesses} />
    </section>
  );
}
