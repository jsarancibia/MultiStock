"use client";

import { useActionState, useMemo, useState } from "react";
import type { BusinessType } from "@/config/business-types";
import type { ProductActionState } from "@/modules/core/products/actions";
import { ProductBasicSection } from "@/components/productos/product-basic-section";
import { ProductPricingSection } from "@/components/productos/product-pricing-section";
import { ProductBusinessFields } from "@/components/productos/product-business-fields";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  formMutedSectionClass,
  formShellClass,
} from "@/components/ui/form-field-styles";
import { FormMessage } from "@/components/ui/form-message";

type Option = { id: string; name: string };
type ProductLike = {
  id: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  unit_type: string;
  cost_price: string;
  sale_price: string;
  min_stock: string;
  current_stock: string;
  category_id: string | null;
  supplier_id: string | null;
  active: boolean;
  metadata: unknown;
};

type ProductFormProps = {
  businessType: BusinessType;
  categories: Option[];
  suppliers: Option[];
  action: (
    prevState: ProductActionState | undefined,
    formData: FormData
  ) => Promise<ProductActionState | undefined>;
  submitLabel: string;
  initialProduct?: ProductLike | null;
  allowInitialStockEdit?: boolean;
  allowMobileBarcodeLink?: boolean;
};

const initialState: ProductActionState = {};

export function ProductForm({
  businessType,
  categories,
  suppliers,
  action,
  submitLabel,
  initialProduct,
  allowInitialStockEdit = true,
  allowMobileBarcodeLink = true,
}: ProductFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const isEditing = Boolean(initialProduct?.id);
  const [quickMode, setQuickMode] = useState(!isEditing);
  const metadata =
    initialProduct?.metadata && typeof initialProduct.metadata === "object"
      ? (initialProduct.metadata as Record<string, unknown>)
      : null;

  const showAdvanced = !quickMode || isEditing;
  const defaultUnitType = initialProduct?.unit_type ?? "unit";
  const defaultCostPrice = initialProduct?.cost_price ?? "0";
  const defaultMinStock = initialProduct?.min_stock ?? "0";
  const quickSummary = useMemo(
    () =>
      quickMode
        ? "Modo rápido: nombre, código opcional, precio de venta y stock inicial."
        : "Modo completo: incluye datos comerciales y técnicos.",
    [quickMode]
  );

  return (
    <form action={formAction} className={formShellClass}>
      {!isEditing ? (
        <div className={cn("flex items-center justify-between", formMutedSectionClass)}>
          <div>
            <p className="text-sm font-medium text-foreground">Modo de carga</p>
            <p className="text-xs text-muted-foreground">{quickSummary}</p>
          </div>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={quickMode}
              onChange={(event) => setQuickMode(event.target.checked)}
            />
            Rápido
          </label>
        </div>
      ) : null}

      <ProductBasicSection
        showAdvanced={showAdvanced}
        nameDefault={initialProduct?.name ?? ""}
        nameError={state?.errors?.name?.[0]}
        unitTypeDefault={defaultUnitType}
        categoryIdDefault={initialProduct?.category_id ?? ""}
        supplierIdDefault={initialProduct?.supplier_id ?? ""}
        skuDefault={initialProduct?.sku ?? ""}
        barcodeDefault={initialProduct?.barcode ?? ""}
        productInstanceKey={initialProduct?.id ?? "create"}
        categories={categories}
        suppliers={suppliers}
        allowMobileBarcodeLink={allowMobileBarcodeLink}
      />

      <ProductPricingSection
        showAdvanced={showAdvanced}
        salePriceDefault={initialProduct?.sale_price ?? "0"}
        currentStockDefault={initialProduct?.current_stock ?? "0"}
        costPriceDefault={defaultCostPrice}
        minStockDefault={defaultMinStock}
        allowInitialStockEdit={allowInitialStockEdit}
        salePriceError={state?.errors?.salePrice?.[0]}
        currentStockError={state?.errors?.currentStock?.[0]}
      />

      <ProductBusinessFields
        businessType={businessType}
        metadata={metadata}
        show={showAdvanced}
      />

      <div className={formMutedSectionClass}>
        <h2 className="mb-2 text-sm font-semibold text-foreground">4) Confirmar</h2>
        <p className="text-xs text-muted-foreground">
          Revisa nombre, precio de venta y stock inicial.
        </p>
        <label className="mt-3 flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" name="active" defaultChecked={initialProduct?.active ?? true} />
          Producto activo
        </label>
      </div>

      <FormMessage message={state?.errors?.unitType?.[0]} />
      <FormMessage message={state?.errors?.costPrice?.[0]} />
      <FormMessage message={state?.errors?.minStock?.[0]} />
      <FormMessage message={state?.errors?.barcode?.[0]} />
      <FormMessage message={state?.message} />

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Guardando..." : submitLabel}
        </Button>
        {!isEditing ? (
          <Button
            type="submit"
            variant="outline"
            name="intent"
            value="create_another"
            disabled={pending}
          >
            {pending ? "Guardando..." : "Guardar y crear otro"}
          </Button>
        ) : null}
      </div>
    </form>
  );
}
