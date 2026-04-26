import { z } from "zod";
import { businessTypeValues } from "@/config/business-types";

export const categorySchema = z.object({
  name: z.string().min(2, "El nombre de la categoria es obligatorio."),
  businessType: z.enum(businessTypeValues),
});

export type CategoryInput = z.infer<typeof categorySchema>;
