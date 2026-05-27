import Link from "next/link";
import { Package } from "lucide-react";
import { CategoryForm } from "@/components/forms/category-form";
import { PageHeader } from "@/components/layout/page-header";
import { ProductsTable } from "@/components/productos/products-table";
import { ProductFilterBar } from "@/components/productos/product-filter-bar";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonVariants } from "@/components/ui/button";
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
        description="Listado general con búsqueda y filtros por negocio activo."
      />

      <PlanUpgradeBanner
        quota={productQuota}
        plan={business.subscription_plan}
        resourceLabel="Productos"
        resourceUnit="productos activos"
      />

      <ProductFilterBar
        defaultValues={{
          q: params.q ?? "",
          categoryId: params.categoryId ?? "",
          supplierId: params.supplierId ?? "",
          status: params.status ?? "all",
          focus: params.focus ?? "all",
        }}
        searchPlaceholder={
          business.business_type === "ferreteria"
            ? "Nombre, SKU, marca o medida"
            : "Buscar por nombre, SKU o código"
        }
        categories={categories.map((c) => ({ value: c.id, label: c.name }))}
        suppliers={suppliers.map((s) => ({ value: s.id, label: s.name }))}
        focusOptions={getProductFocusFilterOptions(business.business_type)}
      />

      {!isEmployee && (
        <div className="flex justify-end">
          <Link href="/productos/nuevo">
            <Button>Nuevo producto</Button>
          </Link>
        </div>
      )}

      {products.length === 0 ? (
        <EmptyState
          icon={<Package aria-hidden />}
          title="No hay productos"
          description={params.q || params.categoryId || params.supplierId ? "No se encontraron productos con los filtros actuales." : "Crea tu primer producto para empezar a vender."}
          action={
            !isEmployee ? (
              <Link href="/productos/nuevo" className={cn(buttonVariants())}>
                Crear producto
              </Link>
            ) : undefined
          }
        />
      ) : (
        <ProductsTable
          businessType={business.business_type}
          products={products}
          suppliers={suppliers.map((s) => ({ id: s.id, name: s.name }))}
          categories={categories.map((c) => ({ id: c.id, name: c.name }))}
          isEmployee={isEmployee}
        />
      )}

      {!isEmployee && (
        <CategoryForm action={createCategoryAction} businessType={business.business_type} />
      )}
    </section>
  );
}
