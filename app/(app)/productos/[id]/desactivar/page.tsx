import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requirePageAccess } from "@/lib/auth/require-page-access";
import { PageHeader } from "@/components/layout/page-header";
import { PageSurface } from "@/components/ui/page-surface";
import { BackButton } from "@/components/ui/back-button";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getProductById, deactivateProductAction } from "@/modules/core/products/actions";

type DesactivarProductoProps = {
  params: Promise<{ id: string }>;
};

async function handleDeactivate(productId: string) {
  "use server";
  await deactivateProductAction(productId);
}

export default async function DesactivarProductoPage({ params }: DesactivarProductoProps) {
  await requirePageAccess(["owner"]);

  const { id } = await params;
  const product = await getProductById(id);

  if (!product) notFound();
  if (!product.active) redirect(`/productos/${id}`);

  return (
    <section className="space-y-6">
      <BackButton href={`/productos/${id}`} />
      <PageHeader
        title={`Desactivar: ${product.name}`}
        description="El producto quedará inactivo y no aparecerá en ventas."
      />

      <PageSurface>
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700 mb-4">
          ¿Estás seguro de desactivar <strong>{product.name}</strong>? El producto no se podrá vender hasta que sea reactivado.
        </div>

        <form action={handleDeactivate.bind(null, id)} className="flex gap-3">
          <button
            type="submit"
            className={cn(buttonVariants({ variant: "destructive" }))}
          >
            Confirmar desactivación
          </button>
          <Link
            href={`/productos/${id}`}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Cancelar
          </Link>
        </form>
      </PageSurface>
    </section>
  );
}
