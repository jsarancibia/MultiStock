export type CreditTransactionType = "sale" | "payment" | "adjustment" | "void";

export type CreditPaymentMethod = "cash" | "transfer" | "mercado_pago" | "khipu" | "other";

export type CreditCustomer = {
  id: string;
  business_id: string;
  rut: string | null;
  name: string;
  phone: string | null;
  credit_limit: number;
  current_balance: number;
  notes: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type CreditCustomerWithMeta = CreditCustomer & {
  last_payment_at: string | null;
  last_sale_at: string | null;
  days_since_last_payment: number | null;
};

export type CreditTransaction = {
  id: string;
  business_id: string;
  customer_id: string;
  type: CreditTransactionType;
  amount: number;
  balance_before: number;
  balance_after: number;
  reference_sale_id: string | null;
  payment_method: string | null;
  description: string | null;
  created_by: string | null;
  created_at: string;
};

export type CreditTransactionWithCreator = CreditTransaction & {
  creator_name: string | null;
};

export type CreditMetrics = {
  totalOutstanding: number;
  activeCustomerCount: number;
  customerCount: number;
  topDebtors: { id: string; name: string; balance: number }[];
  paymentsToday: number;
  paymentsTodayCount: number;
  delinquentCount: number;
};

export type CreditAlertCustomer = {
  id: string;
  name: string;
  current_balance: number;
  credit_limit: number;
  days_since_last_payment: number | null;
};
