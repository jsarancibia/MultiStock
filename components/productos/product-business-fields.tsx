import type { BusinessType } from "@/config/business-types";
import { formSectionClass } from "@/components/ui/form-field-styles";
import { cn } from "@/lib/utils";
import { ProductRubroFields } from "@/components/productos/product-rubro-fields";

type ProductBusinessFieldsProps = {
  businessType: BusinessType;
  metadata: Record<string, unknown> | null;
  show: boolean;
};

export function ProductBusinessFields({
  businessType,
  metadata,
  show,
}: ProductBusinessFieldsProps) {
  return (
    <div className={cn(formSectionClass, !show && "hidden")}>
      <h2 className="mb-3 text-sm font-semibold text-foreground">3) Datos del rubro</h2>
      <ProductRubroFields businessType={businessType} metadata={metadata} />
    </div>
  );
}
