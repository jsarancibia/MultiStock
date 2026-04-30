import type { BusinessType } from "@/config/business-types";
import { businessTypes } from "@/config/business-types";

export type AppModule =
  | "dashboard"
  | "products"
  | "inventory"
  | "sales"
  | "suppliers"
  | "alerts"
  | "audit"
  | "reports"
  | "exports";

export type NavigationItem = {
  label: string;
  href: string;
  module: AppModule;
};

export const navigationItems: NavigationItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    module: "dashboard",
  },
  {
    label: "Productos",
    href: "/productos",
    module: "products",
  },
  {
    label: "Inventario",
    href: "/inventario",
    module: "inventory",
  },
  {
    label: "Ventas",
    href: "/ventas",
    module: "sales",
  },
  {
    label: "Proveedores",
    href: "/proveedores",
    module: "suppliers",
  },
  {
    label: "Alertas",
    href: "/alertas",
    module: "alerts",
  },
  {
    label: "Auditoría",
    href: "/auditoria",
    module: "audit",
  },
  {
    label: "Reportes",
    href: "/reportes",
    module: "reports",
  },
  {
    label: "Exportaciones",
    href: "/exportaciones",
    module: "exports",
  },
];

export function getEnabledModules(businessType: BusinessType): Set<AppModule> {
  const enabled = new Set<AppModule>([
    "dashboard",
    "alerts",
    "audit",
    "reports",
    "exports",
  ]);
  const businessModules = businessTypes[businessType].modules;

  if (businessModules.includes("products")) enabled.add("products");
  if (businessModules.includes("inventory")) enabled.add("inventory");
  if (businessModules.includes("sales")) enabled.add("sales");
  if (businessModules.includes("suppliers")) enabled.add("suppliers");

  return enabled;
}

export function getNavigationForBusinessType(
  businessType: BusinessType
): NavigationItem[] {
  const enabledModules = getEnabledModules(businessType);
  return navigationItems.filter((item) => enabledModules.has(item.module));
}
