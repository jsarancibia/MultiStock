import { PageHeader } from "@/components/layout/page-header";
import { SupplierForm } from "@/components/forms/supplier-form";
import { createSupplierAction } from "@/modules/core/suppliers/actions";

export default function NuevoProveedorPage() {
  return (
    <section className="space-y-6">
      <PageHeader title="Nuevo proveedor" description="Registra un proveedor para asociarlo a productos." />
      <SupplierForm action={createSupplierAction} submitLabel="Crear proveedor" />
    </section>
  );
}
