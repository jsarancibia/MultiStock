import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { listSuppliers } from "@/modules/core/suppliers/actions";

export default async function ProveedoresPage() {
  const suppliers = await listSuppliers();

  return (
    <section className="space-y-6">
      <PageHeader
        title="Proveedores"
        description="Gestion de proveedores del negocio activo."
      />

      <div className="flex justify-end">
        <Link href="/proveedores/nuevo">
          <Button>Nuevo proveedor</Button>
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="px-3 py-2 font-medium">Nombre</th>
              <th className="px-3 py-2 font-medium">Telefono</th>
              <th className="px-3 py-2 font-medium">Email</th>
              <th className="px-3 py-2 font-medium">Direccion</th>
              <th className="px-3 py-2 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((supplier) => (
              <tr key={supplier.id} className="border-t">
                <td className="px-3 py-2">{supplier.name}</td>
                <td className="px-3 py-2">{supplier.phone ?? "-"}</td>
                <td className="px-3 py-2">{supplier.email ?? "-"}</td>
                <td className="px-3 py-2">{supplier.address ?? "-"}</td>
                <td className="px-3 py-2">
                  <Link href={`/proveedores/${supplier.id}/editar`} className="underline underline-offset-4">
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
            {!suppliers.length ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">
                  Todavia no hay proveedores.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
