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

export const forgotPasswordSchema = z.object({
  email: z.email("Ingresa un email valido.").trim(),
});

export const updatePasswordSchema = z
  .object({
    password: z.string().min(6, "La contrasena debe tener al menos 6 caracteres."),
    confirmPassword: z.string().min(1, "Confirma tu contrasena."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contrasenas no coinciden.",
    path: ["confirmPassword"],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Ingresa tu contrasena actual."),
    newPassword: z.string().min(6, "La contrasena debe tener al menos 6 caracteres."),
    confirmNewPassword: z.string().min(1, "Confirma tu nueva contrasena."),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Las contrasenas no coinciden.",
    path: ["confirmNewPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
