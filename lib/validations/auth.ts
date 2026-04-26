import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Ingresa un email valido.").trim(),
  password: z.string().min(6, "La contrasena debe tener al menos 6 caracteres."),
});

export const registerSchema = loginSchema.extend({
  fullName: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(80, "El nombre es demasiado largo.")
    .trim(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
