import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { requireUser } from "@/lib/auth/session";
import { requireActiveBusiness } from "@/lib/business/get-active-business";
import { getBusinessRole } from "@/lib/auth/require-business-role";
import { getPlanLimits, isEffectivelyUnlimited } from "@/config/plans";
import { listCreditCustomers } from "@/modules/core/credit/actions";
import { FiadosTable } from "@/components/ventas/fiados-table";
import { CreditCustomerWithMeta } from "@/types/credit";

export default async function FiadosPage() {
  const user = await requireUser();
  const business = await requireActiveBusiness(user.id);
  const userBusinessRole = await getBusinessRole(user.id, business.id);
  const isOwner = userBusinessRole === "owner";
  const limit = getPlanLimits(business.subscription_plan).creditCustomers;
  const effectivelyUnlimited = isEffectivelyUnlimited(business.subscription_plan, "creditCustomers");
  const isDisabled = limit === 0;

  const customers: CreditCustomerWithMeta[] = await listCreditCustomers();

  const totalOutstanding = customers.reduce((acc, c) => acc + c.current_balance, 0);
  const activeCustomers = customers.filter((c) => c.active);
  const activeWithDebt = activeCustomers.filter((c) => c.current_balance > 0);
  const delinquent = activeCustomers.filter(
    (c) => c.days_since_last_payment !== null && c.days_since_last_payment > 30 && c.current_balance > 0
  );

  return (
    <section className="space-y-6">
      <div className="flex items-start justify-between">
        <PageHeader title="Fiados" description="Clientes con crédito, deudas y pagos." />
        {isOwner && !isDisabled && (
          <Link href="/fiados/clientes/nuevo" className={cn(buttonVariants())}>
            + Nuevo cliente
          </Link>
        )}
      </div>

      {isDisabled && (
        <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-800">
          Fiado no está disponible en tu plan actual.{" "}
          <Link href="/dashboard" className="underline font-medium">
            Ver planes disponibles
          </Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4 text-card-foreground">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Por cobrar</p>
          <p className="text-2xl font-bold mt-1">${totalOutstanding.toLocaleString("es-CL")}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {activeWithDebt.length} cliente{activeWithDebt.length !== 1 ? "s" : ""} con deuda
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 text-card-foreground">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Clientes activos</p>
          <p className="text-2xl font-bold mt-1">{activeCustomers.length}</p>
          {!effectivelyUnlimited && limit !== null && limit > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              de {limit} permitidos
            </p>
          )}
          {effectivelyUnlimited && (
            <p className="text-xs text-muted-foreground mt-1">sin límite</p>
          )}
        </div>
        <div className="rounded-lg border border-border bg-card p-4 text-card-foreground">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Al día</p>
          <p className="text-2xl font-bold mt-1">
            {activeCustomers.length - activeWithDebt.length}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            clientes sin deuda pendiente
          </p>
        </div>
        <div className={delinquent.length > 0
          ? "rounded-lg border border-red-200 bg-red-50 p-4 text-card-foreground"
          : "rounded-lg border border-border bg-card p-4 text-card-foreground"}>
          <p className={delinquent.length > 0
            ? "text-xs text-red-600 uppercase tracking-wide font-medium"
            : "text-xs text-muted-foreground uppercase tracking-wide"}>Morosos (+30 días)</p>
          <p className={delinquent.length > 0 ? "text-2xl font-bold mt-1 text-red-700" : "text-2xl font-bold mt-1"}>{delinquent.length}</p>
          <p className="text-xs text-muted-foreground mt-1">
            sin pago en más de 30 días
          </p>
        </div>
      </div>

      <FiadosTable customers={customers} isOwner={isOwner} />
    </section>
  );
}
