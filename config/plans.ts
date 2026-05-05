import type { AppModule } from "@/config/navigation";

export const subscriptionPlanValues = ["free", "pro", "business"] as const;

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
      products: 30,
      monthlySales: 50,
      monthlyStockMovements: 100,
    },
    modules: ["dashboard", "products", "inventory", "sales", "alerts"],
    mobileScanner: false,
    features: [
      "1 negocio activo",
      "1 cuenta de acceso",
      "Hasta 30 productos activos",
      "Hasta 50 ventas mensuales",
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
    price: "$17.990 mensual (IVA incluido)",
    tag: "Plan recomendado",
    description: "Para negocios que usan MultiStock todos los días.",
    highlighted: true,
    limits: {
      products: null,
      monthlySales: null,
      monthlyStockMovements: null,
    },
    modules: ["dashboard", "products", "inventory", "sales", "suppliers", "alerts", "audit", "reports", "exports"],
    mobileScanner: true,
    features: [
      "1 negocio activo",
      "1 cuenta de acceso",
      "Productos ilimitados",
      "Uso continuo del sistema",
      "Dashboard completo",
      "Productos, inventario, ventas, proveedores y alertas",
      "Escaneo con celular mediante QR",
      "Reportes simples y exportaciones CSV",
      "Auditoría básica",
    ],
    support: [
      "Email + WhatsApp en horario hábil",
      "Respuesta objetivo: 24 a 48 horas",
      "1 sesión inicial de configuración de 30 min",
      "Ayuda para carga inicial de productos",
    ],
  },
  business: {
    id: "business",
    name: "Business",
    price: "$29.990 mensual (IVA incluido)",
    tag: "Más acompañamiento",
    description: "Para negocios con mayor uso o que necesitan más soporte.",
    limits: {
      products: null,
      monthlySales: null,
      monthlyStockMovements: null,
    },
    modules: ["dashboard", "products", "inventory", "sales", "suppliers", "alerts", "audit", "reports", "exports"],
    mobileScanner: true,
    features: [
      "1 negocio activo",
      "1 cuenta de acceso",
      "Productos ilimitados",
      "Uso intensivo",
      "Todo lo incluido en Pro",
      "Auditoría completa",
      "Exportaciones completas",
      "Reportes actuales y futuros",
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
};

export function normalizePlan(plan: string | null | undefined): SubscriptionPlan {
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
