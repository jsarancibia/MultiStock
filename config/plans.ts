import type { AppModule } from "@/config/navigation";

export const subscriptionPlanValues = ["free", "pro", "super", "enterprise"] as const;

export type SubscriptionPlan = (typeof subscriptionPlanValues)[number];

export type PlanDefinition = {
  id: SubscriptionPlan;
  name: string;
  price: string;
  tag: string;
  description: string;
  highlighted?: boolean;
  limits: {
    products: number | null;
    monthlySales: number | null;
    monthlyStockMovements: number | null;
    members: number | null;
  };
  modules: AppModule[];
  mobileScanner: boolean;
  support: string[];
  features: string[];
  limitations?: string[];
};

export const PLAN_DEFINITIONS: Record<SubscriptionPlan, PlanDefinition> = {
  free: {
    id: "free",
    name: "Gratis",
    price: "$0 mensual",
    tag: "Prueba para empezar",
    description: "Para conocer MultiStock con un negocio pequeño y operación básica.",
    limits: {
      products: 50,
      monthlySales: 100,
      monthlyStockMovements: 100,
      members: 1,
    },
    modules: ["dashboard", "products", "inventory", "sales", "alerts", "team"],
    mobileScanner: false,
    features: [
      "1 negocio activo",
      "1 cuenta de acceso",
      "Hasta 50 productos activos",
      "Hasta 100 ventas mensuales",
      "Inventario, ventas y alertas básicas",
      "Escaneo local con cámara del dispositivo",
    ],
    limitations: [
      "Sin reportes completos",
      "Sin exportaciones CSV",
      "Sin auditoría",
      "Sin escaneo con celular mediante QR",
      "Sin módulo de proveedores",
    ],
    support: [
      "Centro de ayuda básico",
      "Soporte por email o formulario",
      "Respuesta objetivo: hasta 72 horas hábiles",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: "$14.990 mensual (IVA incluido)",
    tag: "Plan recomendado",
    description: "Para negocios que usan MultiStock todos los días. Dueño + 1 empleado.",
    highlighted: true,
    limits: {
      products: 500,
      monthlySales: null,
      monthlyStockMovements: 1_000,
      members: 2,
    },
    modules: ["dashboard", "products", "inventory", "sales", "suppliers", "alerts", "audit", "reports", "exports", "team"],
    mobileScanner: true,
    features: [
      "1 negocio activo",
      "2 cuentas de acceso (dueño + 1 empleado)",
      "Hasta 500 productos activos",
      "Ventas ilimitadas",
      "Dashboard completo",
      "Productos, inventario, ventas, proveedores y alertas",
      "Escaneo con celular mediante QR",
      "Reportes y exportaciones CSV",
      "Auditoría básica",
    ],
    support: [
      "Email + WhatsApp en horario hábil",
      "Respuesta objetivo: 24 a 48 horas",
      "1 sesión inicial de configuración de 30 min",
      "Ayuda para carga inicial de productos",
    ],
  },
  super: {
    id: "super",
    name: "Super",
    price: "$24.990 mensual (IVA incluido)",
    tag: "Para negocios en crecimiento",
    description: "Para negocios que necesitan más empleados, productos y capacidad.",
    limits: {
      products: 1_500,
      monthlySales: null,
      monthlyStockMovements: null,
      members: 4,
    },
    modules: ["dashboard", "products", "inventory", "sales", "suppliers", "alerts", "audit", "reports", "exports", "team"],
    mobileScanner: true,
    features: [
      "1 negocio activo",
      "Hasta 4 cuentas de acceso (dueño + 3 empleados)",
      "Hasta 1.500 productos activos",
      "Ventas y movimientos ilimitados",
      "Todo lo incluido en Pro",
      "Exportaciones Excel con temas premium",
      "Soporte prioritario por WhatsApp",
      "Acceso anticipado a nuevas funciones",
    ],
    support: [
      "Soporte prioritario por WhatsApp + email",
      "Respuesta objetivo: 4 a 8 horas",
      "1 sesión inicial de configuración de 60 min",
      "Apoyo en carga inicial de productos",
      "Revisión mensual básica de uso",
    ],
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    price: "$34.990 mensual (IVA incluido)",
    tag: "Sin límites",
    description: "Para negocios grandes que necesitan capacidad ilimitada y soporte dedicado.",
    limits: {
      products: null,
      monthlySales: null,
      monthlyStockMovements: null,
      members: null,
    },
    modules: ["dashboard", "products", "inventory", "sales", "suppliers", "alerts", "audit", "reports", "exports", "team"],
    mobileScanner: true,
    features: [
      "Múltiples negocios/sucursales (cuando esté implementado)",
      "Usuarios ilimitados",
      "Productos ilimitados",
      "Ventas y movimientos ilimitados",
      "Todo lo incluido en Super",
      "Onboarding dedicado (sesión 60 min + revisión mensual)",
      "Soporte premium dedicado",
    ],
    support: [
      "Soporte dedicado máximo",
      "Respuesta objetivo: 1 a 4 horas",
      "Sesión inicial de configuración de 60 min",
      "Revisión mensual de uso y métricas",
    ],
  },
};

/**
 * Mapa de backward compatibility para planes legacy.
 * 'business' se migró a 'super' en DB vía migración SQL.
 * Este mapa asegura que si algún código o dato obsoleto
 * llega con 'business', se interprete como 'super'.
 */
const LEGACY_PLAN_MAP: Record<string, SubscriptionPlan> = {
  business: "super",
};

export function normalizePlan(plan: string | null | undefined): SubscriptionPlan {
  if (!plan) return "free";
  // Backward compatibility: legacy → nuevo
  const mapped = LEGACY_PLAN_MAP[plan];
  if (mapped) return mapped;
  // Válido actual
  return subscriptionPlanValues.includes(plan as SubscriptionPlan)
    ? (plan as SubscriptionPlan)
    : "free";
}

export function canUseModule(plan: SubscriptionPlan, module: AppModule) {
  return PLAN_DEFINITIONS[plan].modules.includes(module);
}

export function canUseMobileScanner(plan: SubscriptionPlan) {
  return PLAN_DEFINITIONS[plan].mobileScanner;
}

export function getPlanLimits(plan: SubscriptionPlan) {
  return PLAN_DEFINITIONS[plan].limits;
}
