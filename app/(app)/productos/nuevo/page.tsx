import { PageHeader } from "@/components/layout/page-header";
import { ProductForm } from "@/components/productos/product-form";
import { createProductAction, getProductFormData } from "@/modules/core/products/actions";

export default async function NuevoProductoPage() {
  const { business, categories, suppliers } = await getProductFormData();

  return (
    <section className="space-y-6">
      <PageHeader title="Nuevo producto" description="Carga un nuevo producto para el negocio activo." />
      <ProductForm
        businessType={business.business_type}
        categories={categories}
        suppliers={suppliers}
        action={createProductAction}
        submitLabel="Crear producto"
      />
    </section>
  );
}
