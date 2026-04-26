export const businessTypeValues = ["verduleria", "almacen", "ferreteria"] as const;

export type BusinessType = (typeof businessTypeValues)[number];

export const businessTypes: Record<
  BusinessType,
  {
    label: string;
    modules: string[];
    productFields: string[];
    dashboard: string;
  }
> = {
  verduleria: {
    label: "Verduleria",
    modules: ["products", "inventory", "sales", "suppliers", "waste"],
    productFields: ["expiration", "weight_sale", "waste_enabled"],
    dashboard: "verduleria",
  },
  almacen: {
    label: "Almacen",
    modules: ["products", "inventory", "sales", "suppliers", "margins"],
    productFields: ["category_margin", "fast_rotation"],
    dashboard: "almacen",
  },
  ferreteria: {
    label: "Ferreteria",
    modules: ["products", "inventory", "sales", "suppliers", "technical_specs"],
    productFields: ["brand", "variant", "technical_specs"],
    dashboard: "ferreteria",
  },
};
