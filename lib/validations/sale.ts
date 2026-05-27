import { z } from "zod";

export const paymentMethodValues = ["cash", "debit", "credit", "transfer", "fiado", "other"] as const;

export const paymentMethodLabels: Record<(typeof paymentMethodValues)[number], string> = {
  cash: "Efectivo",
  debit: "Debito",
  credit: "Credito (tarjeta)",
  transfer: "Transferencia",
  fiado: "Fiado",
  other: "Otro",
};

export const saleItemSchema = z.object({
  productId: z.string().uuid("Producto inválido."),
  quantity: z.coerce
    .number({ message: "Cantidad inválida." })
    .positive("La cantidad debe ser mayor a cero.")
    .refine(
      (q) => Number.isFinite(q) && Math.abs(q - Number(q.toFixed(4))) < 1e-9,
      "La cantidad admite como máximo 4 decimales."
    ),
  unitPrice: z.coerce.number().min(0, "El precio unitario no puede ser negativo."),
});

export const createSaleSchema = z.object({
  paymentMethod: z.enum(paymentMethodValues, { message: "Método de pago inválido." }),
  items: z.array(saleItemSchema).min(1, "Debes agregar al menos un producto."),
});

export type SaleItemInput = z.infer<typeof saleItemSchema>;
export type CreateSaleInput = z.infer<typeof createSaleSchema>;
