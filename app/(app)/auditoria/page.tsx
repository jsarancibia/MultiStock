import { UpgradeRequired } from "@/components/billing/upgrade-required";
import { PageHeader } from "@/components/layout/page-header";
import { getPlanModuleAccess } from "@/lib/billing/require-plan-module";
import { AuditTable } from "@/components/auditoria/audit-table";
import { listAuditLogs } from "@/modules/core/audit/actions";

export default async function AuditoriaPage() {
  const access = await getPlanModuleAccess("audit");
  if (!access.allowed) {
    return (
      <UpgradeRequired
        title="Auditoría disponible desde Pro"
        description="El plan Gratis no muestra el registro de cambios. Actualiza a Pro para revisar acciones sensibles del negocio."
      />
    );
  }

  const rows = await listAuditLogs(200);

  return (
    <section className="space-y-6">
      <PageHeader
        title="Auditoría"
        description="Registro de acciones sensibles: productos, stock, ventas, proveedores y alertas. Visible solo para tu negocio activo."
      />
      <AuditTable rows={rows} />
    </section>
  );
}
