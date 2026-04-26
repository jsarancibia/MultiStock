import { z } from "zod";
import { businessTypeValues } from "@/config/business-types";

export const onboardingSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre del negocio es obligatorio.")
    .max(120, "El nombre del negocio es demasiado largo.")
    .trim(),
  businessType: z.enum(businessTypeValues, "Selecciona un rubro valido."),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
