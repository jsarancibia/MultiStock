import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { SupplierForm } from "@/components/forms/supplier-form";
import { getSupplierById, updateSupplierAction } from "@/modules/core/suppliers/actions";

type EditarProveedorPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditarProveedorPage({ params }: EditarProveedorPageProps) {
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
