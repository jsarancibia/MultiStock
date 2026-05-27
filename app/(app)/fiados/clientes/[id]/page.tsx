import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { BackButton } from "@/components/ui/back-button";
import { PageSurface } from "@/components/ui/page-surface";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { requireUser } from "@/lib/auth/session";
import { requireActiveBusiness } from "@/lib/business/get-active-business";
import { getBusinessRole } from "@/lib/auth/require-business-role";
import { getCreditCustomer, getCustomerTransactions } from "@/modules/core/credit/actions";
import { PaymentForm } from "@/components/ventas/credit-payment-form";
import type { CreditTransaction } from "@/types/credit";

type CustomerDetailProps = {
  params: Promise<{ id: string }>;
};

const TRANSACTION_LABELS: Record<string, string> = {
  sale: "Venta fiado",
  payment: "Pago",
  adjustment: "Ajuste",
  void: "Anulación",
};

function transactionColor(type: string): string {
  switch (type) {
    case "sale": return "text-red-600";
    case "payment": return "text-green-600";
    case "adjustment": return "text-amber-600";
    case "void": return "text-gray-500";
    default: return "";
  }
}

function transactionAmount(type: string, amount: number): string {
  const formatted = `$${Math.abs(amount).toLocaleString("es-CL")}`;
  if (type === "payment" || type === "void") {
    return `-${formatted}`;
  }
  return `+${formatted}`;
}

function getBalanceAfter(allTransactions: { tx: CreditTransaction; creator_name: string | null }[], currentIndex: number): string {
  return `$${allTransactions[currentIndex].tx.balance_after.toLocaleString("es-CL")}`;
}

export default async function CustomerDetailPage({ params }: CustomerDetailProps) {
  const { id } = await params;
  const user = await requireUser();
  const business = await requireActiveBusiness(user.id);
  const userBusinessRole = await getBusinessRole(user.id, business.id);
  const isOwner = userBusinessRole === "owner";

  const customer = await getCreditCustomer(id);
  if (!customer) notFound();

  const transactions = await getCustomerTransactions(id);

  const debtRatio = customer.credit_limit > 0
    ? (customer.current_balance / customer.credit_limit * 100).toFixed(0)
    : null;

  return (
    <section className="space-y-6">
      <BackButton href="/fiados" />

      <div className="flex items-start justify-between">
        <div>
          <PageHeader
            title={customer.name}
            description={customer.rut ? `RUT: ${customer.rut}` : undefined}
          />
          {customer.notes && (
            <p className="mt-1 text-sm text-muted-foreground italic">{customer.notes}</p>
          )}
        </div>
        <div className="flex gap-2">
          {isOwner && (
            <Link
              href={`/fiados/clientes/${customer.id}/editar`}
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Editar
            </Link>
          )}
          {isOwner && customer.current_balance === 0 && (
            <Link
              href={`/fiados/clientes/${customer.id}/eliminar`}
              className={cn(buttonVariants({ variant: "destructive" }))}
            >
              Eliminar
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4 text-card-foreground">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Deuda actual</p>
          <p className="text-2xl font-bold mt-1">${customer.current_balance.toLocaleString("es-CL")}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 text-card-foreground">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Límite de crédito</p>
          <p className="text-2xl font-bold mt-1">
            {customer.credit_limit > 0
              ? `$${customer.credit_limit.toLocaleString("es-CL")}`
              : "Sin límite"}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 text-card-foreground">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Disponible</p>
          <p className={`text-2xl font-bold mt-1 ${customer.current_balance > 0 && customer.credit_limit > 0 && customer.current_balance / customer.credit_limit > 0.8 ? "text-red-600" : ""}`}>
            {customer.credit_limit > 0
              ? `$${Math.max(0, customer.credit_limit - customer.current_balance).toLocaleString("es-CL")}`
              : "—"}
          </p>
          {debtRatio && (
            <p className="text-xs text-muted-foreground mt-1">{debtRatio}% usado</p>
          )}
        </div>
        <div className="rounded-lg border border-border bg-card p-4 text-card-foreground">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Último pago</p>
          <p className="text-2xl font-bold mt-1">
            {customer.last_payment_at
              ? new Date(customer.last_payment_at).toLocaleDateString("es-CL")
              : "—"}
          </p>
          {customer.days_since_last_payment !== null && customer.current_balance > 0 && (
            <p className={`text-xs mt-1 ${customer.days_since_last_payment > 30 ? "text-red-600 font-medium" : "text-muted-foreground"}`}>
              {customer.days_since_last_payment} días sin pago
            </p>
          )}
        </div>
      </div>

      {customer.current_balance > 0 && (
        <PageSurface>
          <h3 className="text-sm font-semibold mb-3">Registrar pago</h3>
          <PaymentForm customerId={customer.id} />
        </PageSurface>
      )}

      <PageSurface>
        <h3 className="text-sm font-semibold mb-3">Historial de movimientos</h3>
        {transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin movimientos registrados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="px-3 py-2 font-medium">Fecha</th>
                  <th className="px-3 py-2 font-medium">Tipo</th>
                  <th className="px-3 py-2 font-medium text-right">Monto</th>
                  <th className="px-3 py-2 font-medium text-right">Saldo después</th>
                  <th className="px-3 py-2 font-medium">Método / Ref.</th>
                  <th className="px-3 py-2 font-medium">Registró</th>
                  <th className="px-3 py-2 font-medium">Descripción</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(({ tx, creator_name }, idx) => (
                  <tr key={tx.id} className="border-t hover:bg-muted/20">
                    <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">
                      {new Date(tx.created_at).toLocaleString("es-CL", { timeZone: "America/Santiago" })}
                    </td>
                    <td className="px-3 py-2">
                      <span className={transactionColor(tx.type)}>
                        {TRANSACTION_LABELS[tx.type] ?? tx.type}
                      </span>
                    </td>
                    <td className={`px-3 py-2 text-right font-medium ${transactionColor(tx.type)}`}>
                      {transactionAmount(tx.type, tx.amount)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {getBalanceAfter(transactions, idx)}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {tx.payment_method ?? (tx.reference_sale_id ? `Venta #${tx.reference_sale_id.slice(0, 8)}` : "—")}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {creator_name ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground max-w-[200px] truncate" title={tx.description ?? ""}>
                      {tx.description ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </PageSurface>
    </section>
  );
}
