import { UpgradeRequired } from "@/components/billing/upgrade-required";
import { PageHeader } from "@/components/layout/page-header";
import { SupplierForm } from "@/components/forms/supplier-form";
import { getPlanModuleAccess } from "@/lib/billing/require-plan-module";
import { createSupplierAction } from "@/modules/core/suppliers/actions";

export default async function NuevoProveedorPage() {
  const access = await getPlanModuleAccess("suppliers");
  if (!access.allowed) {
    return <UpgradeRequired title="Proveedores disponibles desde Pro" />;
  }

  return (
    <section className="space-y-6">
      <PageHeader title="Nuevo proveedor" description="Registra un proveedor para asociarlo a productos." />
      <SupplierForm action={createSupplierAction} submitLabel="Crear proveedor" />
    </section>
  );
}
