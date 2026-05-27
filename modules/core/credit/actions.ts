"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";
import { requireActiveBusiness } from "@/lib/business/get-active-business";
import { requireBusinessRole } from "@/lib/auth/require-business-role";
import { createAuditLog } from "@/lib/audit/create-audit-log";
import { assertCreditCustomerLimit } from "@/lib/billing/plan-guards";
import { humanizeActionError } from "@/lib/errors/action-error";
import {
  creditCustomerSchema,
  creditPaymentSchema,
} from "@/lib/validations/credit";
import type { CreditCustomer, CreditTransaction, CreditCustomerWithMeta } from "@/types/credit";
import type { Database } from "@/types/database";

type CreditCustomerRow = Database["public"]["Tables"]["credit_customers"]["Row"];
type CreditTransactionRow = Database["public"]["Tables"]["credit_transactions"]["Row"];

export type CreditActionState = {
  message?: string;
  errors?: Record<string, string[]>;
};

export async function listCreditCustomers(): Promise<CreditCustomerWithMeta[]> {
  const user = await requireUser();
  const business = await requireActiveBusiness(user.id);
  const supabase = await createClient();

  const { data: customers, error } = await supabase
    .from("credit_customers")
    .select("*")
    .eq("business_id", business.id)
    .order("name");

  if (error) return [];

  const rows = customers as unknown as CreditCustomerRow[];
  const now = new Date();

  const enriched = await Promise.all(
    rows.map(async (c) => {
      const { data: lastTx } = await supabase
        .from("credit_transactions")
        .select("created_at")
        .eq("customer_id", c.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const { data: lastPayment } = await supabase
        .from("credit_transactions")
        .select("created_at")
        .eq("customer_id", c.id)
        .eq("type", "payment")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const lastPaymentAt = lastPayment?.created_at ?? null;
      const lastTxAt = lastTx?.created_at ?? null;
      const daysSinceLastPayment =
        lastPaymentAt
          ? Math.floor((now.getTime() - new Date(lastPaymentAt).getTime()) / (1000 * 60 * 60 * 24))
          : lastTxAt
            ? Math.floor((now.getTime() - new Date(lastTxAt).getTime()) / (1000 * 60 * 60 * 24))
            : null;

      return {
        ...c,
        current_balance: Number(c.current_balance),
        credit_limit: Number(c.credit_limit),
        last_payment_at: lastPaymentAt,
        last_sale_at: lastTxAt,
        days_since_last_payment: daysSinceLastPayment,
      } as CreditCustomerWithMeta;
    })
  );

  return enriched;
}

export async function getCreditCustomer(customerId: string): Promise<CreditCustomerWithMeta | null> {
  const user = await requireUser();
  const business = await requireActiveBusiness(user.id);
  const supabase = await createClient();

  const { data: customer, error } = await supabase
    .from("credit_customers")
    .select("*")
    .eq("id", customerId)
    .eq("business_id", business.id)
    .maybeSingle();

  if (error || !customer) return null;

  const row = customer as unknown as CreditCustomerRow;

  const { data: lastTx } = await supabase
    .from("credit_transactions")
    .select("created_at")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: lastPayment } = await supabase
    .from("credit_transactions")
    .select("created_at")
    .eq("customer_id", customerId)
    .eq("type", "payment")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const now = new Date();
  const lastPaymentAt = lastPayment?.created_at ?? null;
  const lastTxAt = lastTx?.created_at ?? null;
  const daysSinceLastPayment =
    lastPaymentAt
      ? Math.floor((now.getTime() - new Date(lastPaymentAt).getTime()) / (1000 * 60 * 60 * 24))
      : lastTxAt
        ? Math.floor((now.getTime() - new Date(lastTxAt).getTime()) / (1000 * 60 * 60 * 24))
        : null;

  return {
    ...row,
    current_balance: Number(row.current_balance),
    credit_limit: Number(row.credit_limit),
    last_payment_at: lastPaymentAt,
    last_sale_at: lastTxAt,
    days_since_last_payment: daysSinceLastPayment,
  } as CreditCustomerWithMeta;
}

export async function getCustomerTransactions(
  customerId: string
): Promise<{ tx: CreditTransaction; creator_name: string | null }[]> {
  const user = await requireUser();
  const business = await requireActiveBusiness(user.id);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("credit_transactions")
    .select("*, profiles!credit_transactions_created_by_fkey(full_name)")
    .eq("customer_id", customerId)
    .eq("business_id", business.id)
    .order("created_at", { ascending: false });

  if (error) return [];

  const rows = data as unknown as (CreditTransactionRow & {
    profiles: { full_name: string | null } | null;
  })[];

  return rows.map((row) => ({
    tx: {
      id: row.id,
      business_id: row.business_id,
      customer_id: row.customer_id,
      type: row.type,
      amount: Number(row.amount),
      balance_before: Number(row.balance_before),
      balance_after: Number(row.balance_after),
      reference_sale_id: row.reference_sale_id,
      payment_method: row.payment_method,
      description: row.description,
      created_by: row.created_by,
      created_at: row.created_at,
    } as CreditTransaction,
    creator_name: row.profiles?.full_name ?? null,
  }));
}

export async function createCreditCustomerAction(
  _prevState: CreditActionState | undefined,
  formData: FormData
): Promise<CreditActionState | undefined> {
  const { business } = await requireBusinessRole(["owner"]);
  const user = await requireUser();
  const supabase = await createClient();

  const limitMessage = await assertCreditCustomerLimit(supabase, business);
  if (limitMessage) return { message: limitMessage };

  const parsed = creditCustomerSchema.safeParse({
    name: formData.get("name"),
    rut: formData.get("rut"),
    phone: formData.get("phone"),
    creditLimit: formData.get("creditLimit"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const { data: customer, error } = await supabase
    .from("credit_customers")
    .insert({
      business_id: business.id,
      name: parsed.data.name,
      rut: parsed.data.rut,
      phone: parsed.data.phone,
      credit_limit: String(parsed.data.creditLimit),
      notes: parsed.data.notes,
      active: true,
    })
    .select("id,name")
    .single();

  if (error || !customer) {
    if (error?.code === "23505") {
      return { message: "Ya existe un cliente con ese RUT en este negocio." };
    }
    return { message: humanizeActionError(error?.message, "No se pudo crear el cliente.") };
  }

  await createAuditLog({
    businessId: business.id,
    userId: user.id,
    entityType: "credit_customer",
    entityId: customer.id,
    action: "created",
    summary: `Cliente fiado creado: ${customer.name}`,
    afterData: { name: parsed.data.name, credit_limit: parsed.data.creditLimit },
  });

  revalidatePath("/fiados");
  redirect("/fiados");
}

export async function updateCreditCustomerAction(
  customerId: string,
  _prevState: CreditActionState | undefined,
  formData: FormData
): Promise<CreditActionState | undefined> {
  const { business } = await requireBusinessRole(["owner"]);
  const user = await requireUser();
  const supabase = await createClient();

  const parsed = creditCustomerSchema.safeParse({
    name: formData.get("name"),
    rut: formData.get("rut"),
    phone: formData.get("phone"),
    creditLimit: formData.get("creditLimit"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const { data: prior } = await supabase
    .from("credit_customers")
    .select("name, credit_limit, rut, phone")
    .eq("id", customerId)
    .eq("business_id", business.id)
    .maybeSingle();

  if (!prior) return { message: "Cliente no encontrado." };

  const priorRow = prior as unknown as { name: string; credit_limit: string; rut: string | null; phone: string | null };

  const { error } = await supabase
    .from("credit_customers")
    .update({
      name: parsed.data.name,
      rut: parsed.data.rut,
      phone: parsed.data.phone,
      credit_limit: String(parsed.data.creditLimit),
      notes: parsed.data.notes,
    })
    .eq("id", customerId)
    .eq("business_id", business.id);

  if (error) {
    if (error?.code === "23505") {
      return { message: "Ya existe un cliente con ese RUT en este negocio." };
    }
    return { message: humanizeActionError(error?.message, "No se pudo actualizar el cliente.") };
  }

  const limitChanged = Number(priorRow.credit_limit) !== parsed.data.creditLimit;

  await createAuditLog({
    businessId: business.id,
    userId: user.id,
    entityType: "credit_customer",
    entityId: customerId,
    action: limitChanged ? "limit_changed" : "updated",
    summary: limitChanged
      ? `Límite de crédito actualizado: ${priorRow.name} $${priorRow.credit_limit} → $${parsed.data.creditLimit}`
      : `Cliente fiado actualizado: ${parsed.data.name}`,
    beforeData: { credit_limit: Number(priorRow.credit_limit) },
    afterData: { credit_limit: parsed.data.creditLimit },
  });

  revalidatePath("/fiados");
  redirect("/fiados");
}

export async function deactivateCreditCustomerAction(customerId: string) {
  const { business } = await requireBusinessRole(["owner"]);
  const user = await requireUser();
  const supabase = await createClient();

  const { data: customer } = await supabase
    .from("credit_customers")
    .select("name, current_balance")
    .eq("id", customerId)
    .eq("business_id", business.id)
    .maybeSingle();

  const row = customer as unknown as { name: string; current_balance: string } | null;
  if (!row) return { message: "Cliente no encontrado." };
  if (Number(row.current_balance) > 0) {
    return { message: "No se puede desactivar un cliente con deuda pendiente. Registra un pago o ajuste primero." };
  }

  const { error } = await supabase
    .from("credit_customers")
    .update({ active: false })
    .eq("id", customerId)
    .eq("business_id", business.id);

  if (error) return { message: humanizeActionError(error.message, "No se pudo desactivar el cliente.") };

  await createAuditLog({
    businessId: business.id,
    userId: user.id,
    entityType: "credit_customer",
    entityId: customerId,
    action: "deactivated",
    summary: `Cliente fiado desactivado: ${row.name}`,
    beforeData: { active: true },
    afterData: { active: false },
  });

  revalidatePath("/fiados");
  return { success: true };
}

export async function deleteCreditCustomerAction(customerId: string) {
  const { business } = await requireBusinessRole(["owner"]);
  const user = await requireUser();
  const supabase = await createClient();

  const { data: customer } = await supabase
    .from("credit_customers")
    .select("name, current_balance")
    .eq("id", customerId)
    .eq("business_id", business.id)
    .maybeSingle();

  const row = customer as unknown as { name: string; current_balance: string } | null;
  if (!row) return { message: "Cliente no encontrado." };
  if (Number(row.current_balance) > 0) {
    return { message: "No se puede eliminar un cliente con deuda pendiente." };
  }

  const { error } = await supabase
    .from("credit_customers")
    .delete()
    .eq("id", customerId)
    .eq("business_id", business.id);

  if (error) return { message: "No se pudo eliminar el cliente. Puede tener transacciones asociadas." };

  await createAuditLog({
    businessId: business.id,
    userId: user.id,
    entityType: "credit_customer",
    entityId: customerId,
    action: "deleted",
    summary: `Cliente fiado eliminado: ${row.name}`,
    beforeData: { name: row.name },
  });

  revalidatePath("/fiados");
  return { success: true };
}

export async function registerPaymentAction(
  _prevState: CreditActionState | undefined,
  formData: FormData
): Promise<CreditActionState | undefined> {
  const { business } = await requireBusinessRole(["owner", "employee"]);
  const user = await requireUser();
  const supabase = await createClient();

  const parsed = creditPaymentSchema.safeParse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    paymentMethod: formData.get("paymentMethod"),
    description: formData.get("description"),
  });

  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const { error: rpcError } = await supabase.rpc("register_credit_payment", {
    p_business_id: business.id,
    p_customer_id: parsed.data.customerId,
    p_amount: parsed.data.amount,
    p_payment_method: parsed.data.paymentMethod,
    p_description: parsed.data.description ?? null,
    p_created_by: user.id,
  });

  if (rpcError) {
    return { message: humanizeActionError(rpcError?.message ?? "", "No se pudo registrar el pago.") };
  }

  await createAuditLog({
    businessId: business.id,
    userId: user.id,
    entityId: null,
    entityType: "credit_transaction",
    action: "payment_registered",
    summary: `Pago registrado · $${parsed.data.amount} · ${parsed.data.paymentMethod}`,
    metadata: {
      customer_id: parsed.data.customerId,
      amount: parsed.data.amount,
      payment_method: parsed.data.paymentMethod,
    },
  });

  revalidatePath("/fiados");
  return { message: "Pago registrado correctamente." };
}

export async function quickCreateCustomerAction(
  _prevState: { customerId?: string; message?: string } | undefined,
  formData: FormData
): Promise<{ customerId?: string; message?: string; errors?: Record<string, string[]> } | undefined> {
  const { business } = await requireBusinessRole(["owner", "employee"]);
  const supabase = await createClient();

  const parsed = creditCustomerSchema.safeParse({
    name: formData.get("name"),
    rut: formData.get("rut"),
    phone: formData.get("phone"),
    creditLimit: formData.get("creditLimit") || 0,
    notes: formData.get("notes"),
  });

  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const limitMessage = await assertCreditCustomerLimit(supabase, business);
  if (limitMessage) return { message: limitMessage };

  const { data: customer, error } = await supabase
    .from("credit_customers")
    .insert({
      business_id: business.id,
      name: parsed.data.name,
      rut: parsed.data.rut,
      phone: parsed.data.phone,
      credit_limit: String(parsed.data.creditLimit),
      notes: parsed.data.notes,
      active: true,
    })
    .select("id")
    .single();

  if (error) {
    if (error?.code === "23505") {
      return { message: "Ya existe un cliente con ese RUT en este negocio." };
    }
    return { message: humanizeActionError(error?.message, "No se pudo crear el cliente.") };
  }

  revalidatePath("/fiados");
  return { customerId: customer.id };
}

export type CreditCustomerBasic = {
  id: string;
  name: string;
  current_balance: number;
  credit_limit: number;
  active: boolean;
};

export async function listCreditCustomersBasic(): Promise<CreditCustomerBasic[]> {
  const user = await requireUser();
  const business = await requireActiveBusiness(user.id);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("credit_customers")
    .select("id,name,current_balance,credit_limit,active")
    .eq("business_id", business.id)
    .eq("active", true)
    .order("name");

  if (error) return [];

  return (data as unknown as CreditCustomerRow[]).map((c) => ({
    id: c.id,
    name: c.name,
    current_balance: Number(c.current_balance),
    credit_limit: Number(c.credit_limit),
    active: c.active,
  }));
}
