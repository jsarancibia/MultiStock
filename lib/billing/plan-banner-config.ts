import type { SubscriptionPlan } from "@/config/plans";

export type UpgradePath = {
  nextPlanSlug: string;
  nextPlanName: string;
  nextPlanPrice: string;
  benefits: string[];
};

/**
 * Mapa de upgrade: plan actual → siguiente plan con beneficios.
 * Enterprise no tiene upgrade (es el tope).
 */
export const UPGRADE_PATHS: Record<string, UpgradePath | null> = {
  free: {
    nextPlanSlug: "pro",
    nextPlanName: "Pro",
    nextPlanPrice: "$14.990/mes",
    benefits: [
      "Hasta 500 productos",
      "2 usuarios (dueño + 1 empleado)",
      "Reportes, exportaciones y auditoría",
      "Escáner con celular",
      "Módulo de proveedores",
    ],
  },
  pro: {
    nextPlanSlug: "super",
    nextPlanName: "Super",
    nextPlanPrice: "$24.990/mes",
    benefits: [
      "Hasta 1.000 productos",
      "Hasta 4 usuarios",
      "Clientes fiados (cuando esté disponible)",
      "Soporte prioritario por WhatsApp",
      "Acceso anticipado a nuevas funciones",
    ],
  },
  super: {
    nextPlanSlug: "enterprise",
    nextPlanName: "Enterprise",
    nextPlanPrice: "$34.990/mes",
    benefits: [
      "Productos ilimitados",
      "Usuarios ilimitados",
      "Fiado ilimitado (cuando esté disponible)",
      "Más sucursales (cuando esté listo)",
      "Soporte dedicado prioritario",
    ],
  },
  enterprise: null,
};

export function getUpgradePath(plan: SubscriptionPlan): UpgradePath | null {
  return UPGRADE_PATHS[plan] ?? null;
}
