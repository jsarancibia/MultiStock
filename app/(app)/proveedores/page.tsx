import Link from "next/link";
import { Building2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import { listSuppliers } from "@/modules/core/suppliers/actions";

export default async function ProveedoresPage() {
  const suppliers = await listSuppliers();

  return (
    <section className="space-y-6">
      <PageHeader
        title="Proveedores"
        description="Gestión de proveedores del negocio activo."
      />

      {suppliers.length > 0 ? (
        <div className="flex justify-end">
          <Link href="/proveedores/nuevo" className={cn(buttonVariants())}>
            Nuevo proveedor
          </Link>
        </div>
      ) : null}

      {suppliers.length === 0 ? (
        <EmptyState
          icon={<Building2 aria-hidden />}
          title="Aún no cargaste proveedores"
          description="Asigna proveedores a tus productos para filtrar y organizar las compras."
          action={
            <Link href="/proveedores/nuevo" className={cn(buttonVariants())}>
              Añadir proveedor
            </Link>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-3 py-2 font-medium">Nombre</th>
                <th className="px-3 py-2 font-medium">Teléfono</th>
                <th className="px-3 py-2 font-medium">Email</th>
                <th className="px-3 py-2 font-medium">Dirección</th>
                <th className="px-3 py-2 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((supplier) => (
                <tr key={supplier.id} className="border-t">
                  <td className="px-3 py-2">{supplier.name}</td>
                  <td className="px-3 py-2">{supplier.phone ?? "—"}</td>
                  <td className="px-3 py-2">{supplier.email ?? "—"}</td>
                  <td className="px-3 py-2">{supplier.address ?? "—"}</td>
                  <td className="px-3 py-2">
                    <Link href={`/proveedores/${supplier.id}/editar`} className="underline underline-offset-4">
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
