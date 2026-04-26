import { z } from "zod";

export const paymentMethodValues = ["cash", "debit", "credit", "transfer", "other"] as const;

export const paymentMethodLabels: Record<(typeof paymentMethodValues)[number], string> = {
  cash: "Efectivo",
  debit: "Debito",
  credit: "Credito",
  transfer: "Transferencia",
  other: "Otro",
};

export const saleItemSchema = z.object({
  productId: z.string().uuid("Producto invalido."),
  quantity: z.coerce.number().positive("La cantidad debe ser mayor a cero."),
  unitPrice: z.coerce.number().min(0, "El precio unitario no puede ser negativo."),
});

export const createSaleSchema = z.object({
  paymentMethod: z.enum(paymentMethodValues, { message: "Metodo de pago invalido." }),
  items: z.array(saleItemSchema).min(1, "Debes agregar al menos un producto."),
});

export type SaleItemInput = z.infer<typeof saleItemSchema>;
export type CreateSaleInput = z.infer<typeof createSaleSchema>;
