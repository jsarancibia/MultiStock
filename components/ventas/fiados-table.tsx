import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CreditCustomerWithMeta } from "@/types/credit";

type FiadosTableProps = {
  customers: CreditCustomerWithMeta[];
  isOwner: boolean;
};

function balanceColor(balance: number, limit: number): string {
  if (balance === 0) return "text-green-600";
  if (limit > 0 && balance / limit > 0.8) return "text-red-600 font-semibold";
  if (limit > 0 && balance / limit > 0.5) return "text-amber-600";
  return "text-foreground";
}

function statusBadge(customer: CreditCustomerWithMeta) {
  if (!customer.active) {
    return <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">Inactivo</span>;
  }
  if (customer.current_balance === 0) {
    return <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">Al día</span>;
  }
  if (customer.days_since_last_payment !== null && customer.days_since_last_payment > 30) {
    return <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">Moroso</span>;
  }
  return <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">Con deuda</span>;
}

export function FiadosTable({ customers, isOwner }: FiadosTableProps) {
  if (customers.length === 0) {
    return (
      <EmptyState
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="14" x="2" y="5" rx="2" />
            <line x1="2" x2="22" y1="10" y2="10" />
          </svg>
        }
        title="Aún no tienes clientes fiado"
        description="Agrega clientes para empezar a registrar ventas a crédito."
        action={
          isOwner ? (
            <Link href="/fiados/clientes/nuevo" className={cn(buttonVariants())}>
              + Nuevo cliente
            </Link>
          ) : undefined
        }
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[900px] text-sm">
        <thead className="bg-muted/50 text-left">
          <tr>
            <th className="px-3 py-2 font-medium">Cliente</th>
            <th className="px-3 py-2 font-medium">RUT</th>
            <th className="px-3 py-2 font-medium">Teléfono</th>
            <th className="px-3 py-2 font-medium text-right">Deuda</th>
            <th className="px-3 py-2 font-medium text-right">Límite</th>
            <th className="px-3 py-2 font-medium text-right">Disponible</th>
            <th className="px-3 py-2 font-medium">Estado</th>
            <th className="px-3 py-2 font-medium">Última compra</th>
            <th className="px-3 py-2 font-medium">Último pago</th>
            <th className="px-3 py-2 font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => {
            const available = customer.credit_limit - customer.current_balance;
            return (
              <tr key={customer.id} className="border-t hover:bg-muted/20">
                <td className="px-3 py-2 font-medium">{customer.name}</td>
                <td className="px-3 py-2 text-muted-foreground">{customer.rut ?? "—"}</td>
                <td className="px-3 py-2 text-muted-foreground">{customer.phone ?? "—"}</td>
                <td className={`px-3 py-2 text-right ${balanceColor(customer.current_balance, customer.credit_limit)}`}>
                  ${customer.current_balance.toLocaleString("es-CL")}
                </td>
                <td className="px-3 py-2 text-right">
                  {customer.credit_limit > 0
                    ? `$${customer.credit_limit.toLocaleString("es-CL")}`
                    : "—"}
                </td>
                <td className="px-3 py-2 text-right text-muted-foreground">
                  {customer.credit_limit > 0
                    ? `$${Math.max(0, available).toLocaleString("es-CL")}`
                    : "—"}
                </td>
                <td className="px-3 py-2">{statusBadge(customer)}</td>
                <td className="px-3 py-2 text-muted-foreground">
                  {customer.last_sale_at
                    ? new Date(customer.last_sale_at).toLocaleDateString("es-CL")
                    : "—"}
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  {customer.last_payment_at
                    ? new Date(customer.last_payment_at).toLocaleDateString("es-CL")
                    : "—"}
                </td>
                <td className="px-3 py-2">
                  <Link
                    href={`/fiados/clientes/${customer.id}`}
                    className="underline underline-offset-4"
                  >
                    Ver
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
