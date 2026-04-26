import Link from "next/link";
import { CategoryForm } from "@/components/forms/category-form";
import { PageHeader } from "@/components/layout/page-header";
import { ProductsTable } from "@/components/productos/products-table";
import { Button } from "@/components/ui/button";
import { listCategories, createCategoryAction } from "@/modules/core/categories/actions";
import { listSuppliers } from "@/modules/core/suppliers/actions";
import { getProductFocusFilterOptions } from "@/lib/business/business-type-config";
import { listProducts } from "@/modules/core/products/actions";

type ProductosPageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function ProductosPage({ searchParams }: ProductosPageProps) {
  const params = await searchParams;
  const [{ products, business }, categories, suppliers] = await Promise.all([
    listProducts(params),
    listCategories(),
    listSuppliers(),
  ]);

  return (
    <section className="space-y-6">
      <PageHeader
        title="Productos"
        description="Listado general con busqueda y filtros por negocio activo."
      />

      <form className="grid gap-3 rounded-lg border p-4 sm:grid-cols-4">
        <input
          name="q"
          placeholder={
            business.business_type === "ferreteria"
              ? "Nombre, SKU, marca o medida"
              : "Buscar por nombre, SKU o codigo"
          }
          defaultValue={params.q ?? ""}
          className="rounded-md border px-3 py-2 text-sm sm:col-span-2"
        />
        <select name="categoryId" defaultValue={params.categoryId ?? ""} className="rounded-md border px-3 py-2 text-sm">
          <option value="">Todas las categorias</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <select name="supplierId" defaultValue={params.supplierId ?? ""} className="rounded-md border px-3 py-2 text-sm">
          <option value="">Todos los proveedores</option>
          {suppliers.map((supplier) => (
            <option key={supplier.id} value={supplier.id}>
              {supplier.name}
            </option>
          ))}
        </select>
        <select name="status" defaultValue={params.status ?? "all"} className="rounded-md border px-3 py-2 text-sm">
          <option value="all">Todos</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>
        <select name="focus" defaultValue={params.focus ?? "all"} className="rounded-md border px-3 py-2 text-sm sm:col-span-2">
          {getProductFocusFilterOptions(business.business_type).map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="sm:col-span-2" />
        <Button type="submit" variant="outline">
          Aplicar filtros
        </Button>
      </form>

      <div className="flex justify-end">
        <Link href="/productos/nuevo">
          <Button>Nuevo producto</Button>
        </Link>
      </div>

      <ProductsTable businessType={business.business_type} products={products} />

      <CategoryForm action={createCategoryAction} businessType={business.business_type} />
    </section>
  );
}
