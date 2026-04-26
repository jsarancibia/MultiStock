import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { getProductById, deactivateProductAction } from "@/modules/core/products/actions";

type ProductDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  return (
    <section className="space-y-6">
      <PageHeader title={product.name} description="Detalle completo del producto." />

      <div className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2">
        <p><strong>SKU:</strong> {product.sku ?? "-"}</p>
        <p><strong>Codigo:</strong> {product.barcode ?? "-"}</p>
        <p><strong>Unidad:</strong> {product.unit_type}</p>
        <p><strong>Categoria:</strong> {product.categories?.name ?? "-"}</p>
        <p><strong>Proveedor:</strong> {product.suppliers?.name ?? "-"}</p>
        <p><strong>Estado:</strong> {product.active ? "Activo" : "Inactivo"}</p>
        <p><strong>Costo:</strong> ${product.cost_price}</p>
        <p><strong>Venta:</strong> ${product.sale_price}</p>
        <p><strong>Stock actual:</strong> {product.current_stock}</p>
        <p><strong>Stock minimo:</strong> {product.min_stock}</p>
      </div>

      <details className="rounded-lg border p-4">
        <summary className="cursor-pointer font-medium">Metadata por rubro</summary>
        <pre className="mt-3 overflow-x-auto rounded bg-muted p-3 text-xs">
          {JSON.stringify(product.metadata, null, 2)}
        </pre>
      </details>

      <div className="flex flex-wrap gap-3">
        <Link href={`/productos/${product.id}/editar`}>
          <Button variant="outline">Editar</Button>
        </Link>
        {product.active ? (
          <form action={deactivateProductAction.bind(null, product.id)}>
            <Button variant="destructive" type="submit">
              Desactivar
            </Button>
          </form>
        ) : null}
      </div>
    </section>
  );
}
