import { z } from "zod";
import { businessTypeValues } from "@/config/business-types";
import { barcodeFieldSchema } from "@/lib/validations/barcode";

export const unitTypeValues = ["unit", "kg", "g", "box", "liter", "meter"] as const;

export const productMetadataSchema = z.record(z.string(), z.unknown()).default({});

export const productSchema = z.object({
  name: z.string().min(2, "El nombre es obligatorio."),
  categoryId: z.string().uuid().optional().or(z.literal("")),
  supplierId: z.string().uuid().optional().or(z.literal("")),
  sku: z.string().max(120).optional().or(z.literal("")),
  barcode: barcodeFieldSchema,
  unitType: z.enum(unitTypeValues, { message: "Unidad invalida." }),
  costPrice: z.coerce.number().min(0, "Costo invalido."),
  salePrice: z.coerce.number().min(0, "Precio de venta invalido."),
  minStock: z.coerce.number().min(0, "Stock minimo invalido."),
  currentStock: z.coerce.number().min(0, "Stock actual invalido."),
  active: z.coerce.boolean().default(true),
  businessType: z.enum(businessTypeValues),
  metadata: productMetadataSchema,
});

export const productFilterFocusValues = [
  "all",
  "perishable",
  "fast_rotation",
  "low_margin",
  "stale",
] as const;

export const productFiltersSchema = z.object({
  q: z.string().optional().default(""),
  categoryId: z.string().uuid().optional().or(z.literal("")),
  supplierId: z.string().uuid().optional().or(z.literal("")),
  status: z.enum(["all", "active", "inactive"]).default("all"),
  focus: z.enum(productFilterFocusValues).default("all"),
});

export type ProductInput = z.infer<typeof productSchema>;
export type ProductFiltersInput = z.infer<typeof productFiltersSchema>;
