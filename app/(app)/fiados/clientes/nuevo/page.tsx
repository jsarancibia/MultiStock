import { requirePageAccess } from "@/lib/auth/require-page-access";
import { PageHeader } from "@/components/layout/page-header";
import { PageSurface } from "@/components/ui/page-surface";
import { CreditCustomerForm } from "@/components/forms/credit-customer-form";
import { createCreditCustomerAction } from "@/modules/core/credit/actions";

export default async function NuevoClientePage() {
  await requirePageAccess(["owner"]);

  return (
    <section className="space-y-6">
      <PageHeader
        title="Nuevo cliente fiado"
        description="Registra un cliente para empezar a venderle a crédito."
      />

      <PageSurface>
        <CreditCustomerForm action={createCreditCustomerAction} submitLabel="Guardar cliente" />
      </PageSurface>
    </section>
  );
}
