import { z } from "zod";

export const supplierSchema = z.object({
  name: z.string().min(2, "El nombre del proveedor es obligatorio."),
  phone: z.string().max(40).optional().or(z.literal("")),
  email: z.email("Email invalido.").optional().or(z.literal("")),
  address: z.string().max(240).optional().or(z.literal("")),
});

export type SupplierInput = z.infer<typeof supplierSchema>;
