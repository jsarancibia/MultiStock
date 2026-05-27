import Link from "next/link";
import { CategoryForm } from "@/components/forms/category-form";
import { PageHeader } from "@/components/layout/page-header";
import { ProductsTable } from "@/components/productos/products-table";
import { Button } from "@/components/ui/button";
import {
  panelInputClass,
  panelSelectClass,
} from "@/components/ui/form-field-styles";
import { cn } from "@/lib/utils";
import { listCategories, createCategoryAction } from "@/modules/core/categories/actions";
import { listSuppliers } from "@/modules/core/suppliers/actions";
import { getProductFocusFilterOptions } from "@/lib/business/business-type-config";
import { listProducts } from "@/modules/core/products/actions";
import { getBusinessRole } from "@/lib/auth/require-business-role";
import { requireUser } from "@/lib/auth/session";
import { requireActiveBusiness } from "@/lib/business/get-active-business";
import { getProductQuota } from "@/lib/billing/get-quota";
import { PlanUpgradeBanner } from "@/components/billing/plan-upgrade-banner";

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

  // Verificar si el usuario es employee para ocultar botones de edición
  const user = await requireUser();
  const activeBusiness = await requireActiveBusiness(user.id);
  const userBusinessRole = await getBusinessRole(user.id, activeBusiness.id);
  const isEmployee = userBusinessRole === "employee";

  // Cuota de productos para el banner de upgrade
  const productQuota = await getProductQuota(business);

  return (
    <section className="space-y-6">
      <PageHeader
        title="Productos"
        description="Listado general con busqueda y filtros por negocio activo."
      />

      <PlanUpgradeBanner
        quota={productQuota}
        plan={business.subscription_plan}
        resourceLabel="Productos"
        resourceUnit="productos activos"
      />

      <form id="product-filters" className="grid gap-3 rounded-lg border border-border bg-card p-4 text-card-foreground sm:grid-cols-4">
        <input
          name="q"
          placeholder={
            business.business_type === "ferreteria"
              ? "Nombre, SKU, marca o medida"
              : "Buscar por nombre, SKU o codigo"
          }
          defaultValue={params.q ?? ""}
          className={cn(panelInputClass, "sm:col-span-2")}
        />
        <select
          name="categoryId"
          defaultValue={params.categoryId ?? ""}
          className={panelSelectClass}
          onChange={() => (document.getElementById("product-filters") as HTMLFormElement).requestSubmit()}
        >
          <option value="">Todas las categorias</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <select name="supplierId" defaultValue={params.supplierId ?? ""} className={panelSelectClass}
          onChange={() => (document.getElementById("product-filters") as HTMLFormElement).requestSubmit()}
        >
          <option value="">Todos los proveedores</option>
          {suppliers.map((supplier) => (
            <option key={supplier.id} value={supplier.id}>
              {supplier.name}
            </option>
          ))}
        </select>
        <select name="status" defaultValue={params.status ?? "all"} className={panelSelectClass}
          onChange={() => (document.getElementById("product-filters") as HTMLFormElement).requestSubmit()}
        >
          <option value="all">Todos</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>
        <select
          name="focus"
          defaultValue={params.focus ?? "all"}
          className={cn(panelSelectClass, "sm:col-span-2")}
          onChange={() => (document.getElementById("product-filters") as HTMLFormElement).requestSubmit()}
        >
          {getProductFocusFilterOptions(business.business_type).map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </form>

      {!isEmployee && (
        <div className="flex justify-end">
          <Link href="/productos/nuevo">
            <Button>Nuevo producto</Button>
          </Link>
        </div>
      )}

      <ProductsTable
        businessType={business.business_type}
        products={products}
        suppliers={suppliers.map((s) => ({ id: s.id, name: s.name }))}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        isEmployee={isEmployee}
      />

      {!isEmployee && (
        <CategoryForm action={createCategoryAction} businessType={business.business_type} />
      )}
    </section>
  );
}
