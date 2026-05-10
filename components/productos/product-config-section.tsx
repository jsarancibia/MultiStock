"use client";

import { useState } from "react";
import type { BusinessType } from "@/config/business-types";
import { ProductRubroFields } from "@/components/productos/product-rubro-fields";
import { formSectionClass } from "@/components/ui/form-field-styles";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

type ProductConfigSectionProps = {
  businessType: BusinessType;
  metadata: Record<string, unknown> | null;
};

export function ProductConfigSection({ businessType, metadata }: ProductConfigSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={formSectionClass}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-left"
      >
        <div>
          <h2 className="text-sm font-semibold text-foreground">4) Configuración del producto</h2>
          <p className="text-xs text-muted-foreground">Campos avanzados según tu tipo de negocio</p>
        </div>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </button>
      <div
        className={cn(
          "grid transition-all",
          isOpen ? "mt-3 grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <ProductRubroFields businessType={businessType} metadata={metadata} />
        </div>
      </div>
    </div>
  );
}
