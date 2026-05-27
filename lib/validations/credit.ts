import { z } from "zod";

export const creditCustomerSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(120),
  rut: z
    .string()
    .max(20)
    .nullable()
    .optional()
    .transform((v) => (v && v.trim() ? v.trim() : null)),
  phone: z
    .string()
    .max(30)
    .nullable()
    .optional()
    .transform((v) => (v && v.trim() ? v.trim() : null)),
  creditLimit: z.coerce.number("El límite debe ser un número").min(0, "El límite no puede ser negativo"),
  notes: z
    .string()
    .max(500)
    .nullable()
    .optional()
    .transform((v) => (v && v.trim() ? v.trim() : null)),
});

export const creditPaymentSchema = z.object({
  customerId: z.string().uuid(),
  amount: z.coerce.number("El monto debe ser un número").positive("El monto debe ser mayor a cero"),
  paymentMethod: z.enum(["cash", "transfer", "mercado_pago", "khipu", "other"], {
    message: "Selecciona un método de pago válido",
  }),
  description: z
    .string()
    .max(300)
    .nullable()
    .optional()
    .transform((v) => (v && v.trim() ? v.trim() : null)),
});

export const creditAdjustmentSchema = z.object({
  customerId: z.string().uuid(),
  amount: z.number(),
  reason: z.string().min(10, "Debes indicar una razón detallada para el ajuste").max(500),
});

export type CreditCustomerInput = z.infer<typeof creditCustomerSchema>;
export type CreditPaymentInput = z.infer<typeof creditPaymentSchema>;
export type CreditAdjustmentInput = z.infer<typeof creditAdjustmentSchema>;
