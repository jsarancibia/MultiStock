import { notFound } from "next/navigation";
import { UpgradeRequired } from "@/components/billing/upgrade-required";
import { PageHeader } from "@/components/layout/page-header";
import { SupplierForm } from "@/components/forms/supplier-form";
import { getPlanModuleAccess } from "@/lib/billing/require-plan-module";
import { getSupplierById, updateSupplierAction } from "@/modules/core/suppliers/actions";

type EditarProveedorPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditarProveedorPage({ params }: EditarProveedorPageProps) {
  const access = await getPlanModuleAccess("suppliers");
  if (!access.allowed) {
    return <UpgradeRequired title="Proveedores disponibles desde Pro" />;
  }

  const { id } = await params;
  const supplier = await getSupplierById(id);
  if (!supplier) notFound();

  return (
    <section className="space-y-6">
      <PageHeader title="Editar proveedor" description={`Actualiza los datos de ${supplier.name}.`} />
      <SupplierForm
        action={updateSupplierAction.bind(null, id)}
        submitLabel="Guardar cambios"
        initialSupplier={supplier}
      />
    </section>
  );
}
