import type { BusinessType } from "@/config/business-types";
import { VerduleriaProductFields } from "@/modules/verduleria/product-fields";
import { AlmacenProductFields } from "@/modules/almacen/product-fields";
import { FerreteriaProductFields } from "@/modules/ferreteria/product-fields";

type ProductRubroFieldsProps = {
  businessType: BusinessType;
  metadata?: Record<string, unknown> | null;
};

export function ProductRubroFields({ businessType, metadata }: ProductRubroFieldsProps) {
  if (businessType === "verduleria") return <VerduleriaProductFields metadata={metadata} />;
  if (businessType === "almacen") return <AlmacenProductFields metadata={metadata} />;
  return <FerreteriaProductFields metadata={metadata} />;
}
