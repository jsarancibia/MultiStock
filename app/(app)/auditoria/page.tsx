import { PageHeader } from "@/components/layout/page-header";
import { AuditTable } from "@/components/auditoria/audit-table";
import { listAuditLogs } from "@/modules/core/audit/actions";

export default async function AuditoriaPage() {
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
