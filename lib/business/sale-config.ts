import type { BusinessType } from "@/config/business-types";

export type SaleConfig = {
  showQuickButtons: boolean;
  searchPlaceholder: string;
  searchAutoFocus: boolean;
  quantityHint: string | null;
  weightStep: number;
};

export const saleConfigByType: Record<BusinessType, SaleConfig> = {
  verduleria: {
    showQuickButtons: true,
    searchPlaceholder: "Buscar por nombre (banana, tomate...)",
    searchAutoFocus: false,
    quantityHint: "Kg y litros aceptan decimales. Ej: 0,850 kg de uva.",
    weightStep: 0.5,
  },
  almacen: {
    showQuickButtons: false,
    searchPlaceholder: "Código de barras, SKU o nombre del producto",
    searchAutoFocus: true,
    quantityHint: null,
    weightStep: 1,
  },
  ferreteria: {
    showQuickButtons: false,
    searchPlaceholder: "SKU, marca, medida o nombre del artículo",
    searchAutoFocus: true,
    quantityHint: null,
    weightStep: 1,
  },
};

export function getSaleConfig(type: BusinessType): SaleConfig {
  return saleConfigByType[type];
}
