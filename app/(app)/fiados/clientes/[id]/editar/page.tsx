import { notFound } from "next/navigation";
import { requirePageAccess } from "@/lib/auth/require-page-access";
import { PageHeader } from "@/components/layout/page-header";
import { PageSurface } from "@/components/ui/page-surface";
import { CreditCustomerForm } from "@/components/forms/credit-customer-form";
import { getCreditCustomer, updateCreditCustomerAction } from "@/modules/core/credit/actions";

type EditCustomerProps = {
  params: Promise<{ id: string }>;
};

export default async function EditClientePage({ params }: EditCustomerProps) {
  await requirePageAccess(["owner"]);
  const { id } = await params;

  const customer = await getCreditCustomer(id);
  if (!customer) notFound();

  return (
    <section className="space-y-6">
      <PageHeader
        title={`Editar: ${customer.name}`}
        description="Actualiza los datos del cliente fiado."
      />

      <PageSurface>
        <CreditCustomerForm
          action={updateCreditCustomerAction.bind(null, customer.id)}
          submitLabel="Guardar cambios"
          defaultValues={{
            name: customer.name,
            rut: customer.rut ?? "",
            phone: customer.phone ?? "",
            creditLimit: customer.credit_limit,
            notes: customer.notes ?? "",
          }}
        />
      </PageSurface>
    </section>
  );
}
