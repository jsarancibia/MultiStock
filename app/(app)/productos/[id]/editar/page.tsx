import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { ProductForm } from "@/components/productos/product-form";
import { getProductById, getProductFormData, updateProductAction } from "@/modules/core/products/actions";

type EditarProductoPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditarProductoPage({ params }: EditarProductoPageProps) {
  const { id } = await params;
  const [product, formData] = await Promise.all([getProductById(id), getProductFormData()]);
  if (!product) notFound();

  return (
    <section className="space-y-6">
      <PageHeader title="Editar producto" description={`Actualiza los datos de ${product.name}.`} />
      <ProductForm
        businessType={formData.business.business_type}
        categories={formData.categories}
        suppliers={formData.suppliers}
        initialProduct={product}
        allowInitialStockEdit={false}
        action={updateProductAction.bind(null, product.id)}
        submitLabel="Guardar cambios"
      />
    </section>
  );
}
