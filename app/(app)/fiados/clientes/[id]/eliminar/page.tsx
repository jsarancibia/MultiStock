import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requirePageAccess } from "@/lib/auth/require-page-access";
import { PageHeader } from "@/components/layout/page-header";
import { PageSurface } from "@/components/ui/page-surface";
import { BackButton } from "@/components/ui/back-button";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getCreditCustomer, deleteCreditCustomerAction } from "@/modules/core/credit/actions";

type EliminarClienteProps = {
  params: Promise<{ id: string }>;
};

async function handleDelete(customerId: string) {
  "use server";
  const result = await deleteCreditCustomerAction(customerId);
  if ("success" in result && result.success) {
    redirect("/fiados");
  }
}

export default async function EliminarClientePage({ params }: EliminarClienteProps) {
  await requirePageAccess(["owner"]);

  const { id } = await params;
  const customer = await getCreditCustomer(id);

  if (!customer) notFound();
  if (customer.current_balance > 0) redirect(`/fiados/clientes/${id}`);

  return (
    <section className="space-y-6">
      <BackButton href={`/fiados/clientes/${id}`} />
      <PageHeader
        title={`Eliminar: ${customer.name}`}
        description="Esta acción no se puede deshacer."
      />

      <PageSurface>
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700 mb-4">
          ¿Estás seguro de eliminar a <strong>{customer.name}</strong>? Sus datos se perderán permanentemente.
        </div>

        <form action={handleDelete.bind(null, id)} className="flex gap-3">
          <button
            type="submit"
            className={cn(buttonVariants({ variant: "destructive" }))}
          >
            Confirmar eliminación
          </button>
          <Link
            href={`/fiados/clientes/${id}`}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Cancelar
          </Link>
        </form>
      </PageSurface>
    </section>
  );
}
