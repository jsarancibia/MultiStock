import type { SubscriptionPlan } from "@/config/plans";

/**
 * Límites "mostrados en UI" para el banner de upgrade.
 * Reflejan la nueva estructura de planes propuesta (Free 50, Pro 500, Super 1.500, Enterprise ∞)
 * SIN modificar la configuración real de planes existente.
 */
export const BANNER_PLAN_LIMITS: Record<
  string,
  { products: number | null; members: number | null }
> = {
  free: { products: 50, members: 1 },
  pro: { products: 500, members: 2 },
  business: { products: 1_500, members: 4 },
};

export type UpgradePath = {
  nextPlanSlug: string;
  nextPlanName: string;
  nextPlanPrice: string;
  benefits: string[];
};

/**
 * Mapa de upgrade: plan actual → siguiente plan con beneficios.
 * Cada plan tiene su "siguiente escalón" con lo que se gana.
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
      "Hasta 1.500 productos",
      "Hasta 4 usuarios",
      "Clientes fiados (cuando exista)",
      "Soporte prioritario por WhatsApp",
      "Acceso anticipado a nuevas funciones",
    ],
  },
  business: {
    nextPlanSlug: "enterprise",
    nextPlanName: "Enterprise",
    nextPlanPrice: "$34.990/mes",
    benefits: [
      "Productos ilimitados",
      "Usuarios ilimitados",
      "Fiado ilimitado (cuando exista)",
      "Múltiples sucursales (cuando esté listo)",
      "Soporte dedicado prioritario",
    ],
  },
};

export function getUpgradePath(plan: SubscriptionPlan): UpgradePath | null {
  return UPGRADE_PATHS[plan] ?? null;
}

export function getBannerLimit(
  plan: SubscriptionPlan,
  resource: "products" | "members"
): number | null {
  const limits = BANNER_PLAN_LIMITS[plan];
  if (!limits) return null;
  return limits[resource] ?? null;
}
