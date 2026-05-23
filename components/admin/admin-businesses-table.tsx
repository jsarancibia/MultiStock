import { PageSurface } from "@/components/ui/page-surface";
import { UserPlanSelect } from "@/components/admin/user-plan-select";
import { updateUserPlanAction } from "@/modules/admin/actions";
import { formatSystemDateTime } from "@/lib/utils";

type AdminBusinessRow = {
  id: string;
  name: string;
  business_type: string;
  subscription_plan: "free" | "pro" | "super" | "enterprise";
  owner_id: string;
  owner_email: string | null;
  created_at: string;
};

type AdminBusinessesTableProps = {
  businesses: AdminBusinessRow[];
};

function formatDate(value: string) {
  return formatSystemDateTime(value);
}

export function AdminBusinessesTable({ businesses }: AdminBusinessesTableProps) {
  return (
    <PageSurface className="overflow-x-auto p-0">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-4 py-3">Negocio</th>
            <th className="px-4 py-3">Dueño</th>
            <th className="px-4 py-3">Rubro</th>
            <th className="px-4 py-3">Plan</th>
            <th className="px-4 py-3">Cambiar plan</th>
            <th className="px-4 py-3">Creado</th>
          </tr>
        </thead>
        <tbody>
          {businesses.map((business) => (
            <tr key={business.id} className="border-b border-border/70">
              <td className="px-4 py-3 text-foreground">{business.name}</td>
              <td className="px-4 py-3 text-muted-foreground">
                {business.owner_email ?? "Sin email"}
              </td>
              <td className="px-4 py-3 text-muted-foreground">{business.business_type}</td>
              <td className="px-4 py-3 text-muted-foreground">{business.subscription_plan}</td>
              <td className="px-4 py-3">
                <UserPlanSelect
                  userId={business.owner_id}
                  currentPlan={business.subscription_plan}
                  action={updateUserPlanAction}
                />
              </td>
              <td className="px-4 py-3 text-muted-foreground">{formatDate(business.created_at)}</td>
            </tr>
          ))}
          {businesses.length === 0 ? (
            <tr>
              <td className="px-4 py-6 text-muted-foreground" colSpan={6}>
                No hay negocios registrados.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </PageSurface>
  );
}
