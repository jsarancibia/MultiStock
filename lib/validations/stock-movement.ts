import { z } from "zod";

export const stockMovementTypeValues = [
  "initial_stock",
  "purchase",
  "adjustment",
  "waste",
  "return",
] as const;

export const stockMovementSchema = z.object({
  productId: z.string().uuid("Producto invalido."),
  type: z.enum(stockMovementTypeValues, { message: "Tipo de movimiento invalido." }),
  quantity: z.coerce
    .number()
    .refine((value) => value !== 0, "La cantidad no puede ser cero."),
  reason: z.string().max(240).optional().or(z.literal("")),
  unitCost: z.coerce.number().min(0).optional(),
});

export type StockMovementInput = z.infer<typeof stockMovementSchema>;
