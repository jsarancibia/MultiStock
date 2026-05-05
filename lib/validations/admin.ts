import { z } from "zod";

export const adminRoleValues = ["user", "admin"] as const;
export const adminPlanValues = ["free", "pro", "business"] as const;

export const adminRoleSchema = z.enum(adminRoleValues);
export const adminPlanSchema = z.enum(adminPlanValues);

export const updateUserPlanSchema = z.object({
  userId: z.string().uuid("Usuario inválido."),
  plan: adminPlanSchema,
});

export const updateUserRoleSchema = z.object({
  userId: z.string().uuid("Usuario inválido."),
  role: adminRoleSchema,
});
