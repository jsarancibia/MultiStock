"use client";

import { useActionState, useMemo, useRef, useState } from "react";
import type { BusinessType } from "@/config/business-types";
import type { ProductActionState } from "@/modules/core/products/actions";
import { ProductBasicSection } from "@/components/productos/product-basic-section";
import { ProductPricingSection } from "@/components/productos/product-pricing-section";
import { ProductQuickSaleSection } from "@/components/productos/product-quick-sale-section";
import { ProductConfigSection } from "@/components/productos/product-config-section";
import { Button } from "@/components/ui/button";
import { PageNavigation } from "@/components/ui/page-navigation";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { WizardStepper, type WizardStep } from "@/components/ui/wizard-stepper";
import { cn } from "@/lib/utils";
import {
  formMutedSectionClass,
} from "@/components/ui/form-field-styles";
import { FormMessage } from "@/components/ui/form-message";
import { useBeforeUnload } from "@/lib/hooks/use-before-unload";

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
  /** Ruta a la que volver. Por defecto "/productos". */
  backHref?: string;
};

const initialState: ProductActionState = {};

const wizardSteps: WizardStep[] = [
  { id: "basicos", label: "Datos básicos" },
  { id: "precio", label: "Precio y stock" },
  { id: "venta-rapida", label: "Venta rápida" },
  { id: "config", label: "Configuración" },
];

export function ProductForm({
  businessType,
  categories,
  suppliers,
  action,
  submitLabel,
  initialProduct,
  allowInitialStockEdit = true,
  allowMobileBarcodeLink = true,
  backHref = "/productos",
}: ProductFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [isDirty, setIsDirty] = useState(false);
  useBeforeUnload(isDirty);
  const isEditing = Boolean(initialProduct?.id);
  const [quickMode, setQuickMode] = useState(!isEditing);
  const [currentStep, setCurrentStep] = useState(0);
  const topRef = useRef<HTMLDivElement>(null);

  const metadata =
    initialProduct?.metadata && typeof initialProduct.metadata === "object"
      ? (initialProduct.metadata as Record<string, unknown>)
      : null;

  const showAdvanced = !quickMode || isEditing;
  const maxSteps = showAdvanced ? wizardSteps.length : 1;

  const defaultUnitType = initialProduct?.unit_type ?? "unit";
  const defaultCostPrice = initialProduct?.cost_price ?? "0";
  const defaultMinStock = initialProduct?.min_stock ?? "0";
  const quickSummary = useMemo(
    () =>
      quickMode
        ? "Modo rápido: nombre, precio de venta y stock inicial. SKU y código de barras son opcionales."
        : "Modo completo: incluye datos comerciales y técnicos.",
    [quickMode]
  );

  function goToStep(step: number) {
    setCurrentStep(step);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleNext() {
    if (currentStep < maxSteps - 1) {
      goToStep(currentStep + 1);
    }
  }

  function handlePrev() {
    if (currentStep > 0) {
      goToStep(currentStep - 1);
    }
  }

  // En modo rápido o edición, mostrar todo (comportamiento original)
  const showAllSections = !showAdvanced || isEditing;

  // Valores por defecto para venta rápida y configuración
  const defaultFastRotation = metadata?.fast_rotation === true;
  const defaultPinned = metadata?.pinned === true;

  return (
    <div ref={topRef} className="space-y-6">
      <PageNavigation backHref={backHref} />

      {/* Wizard stepper (solo en modo avanzado/creación) */}
      {showAdvanced && !isEditing ? (
        <WizardStepper
          steps={wizardSteps}
          currentStep={currentStep}
          onStepClick={(step) => {
            if (step <= currentStep) {
              goToStep(step);
            }
          }}
        />
      ) : null}

      <form action={formAction} className="space-y-6" onChange={() => setIsDirty(true)}>
        {!isEditing ? (
          <div className={cn("flex items-center justify-between", formMutedSectionClass)}>
            <div>
              <p className="text-sm font-medium text-foreground">Modo de carga</p>
              <p className="text-xs text-muted-foreground">{quickSummary}</p>
            </div>
            <ToggleSwitch
              name=""
              label="Rápido"
              checked={quickMode}
              onChange={(checked) => {
                setQuickMode(checked);
                setCurrentStep(0);
              }}
            />
          </div>
        ) : null}

        {/* Paso 1 — Datos básicos (o sección única en modo rápido) */}
        <div className={showAllSections || currentStep === 0 ? "" : "hidden"}>
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
        </div>

        {/* Paso 2 — Precio y stock */}
        <div className={showAllSections || currentStep === 1 ? "" : "hidden"}>
          <ProductPricingSection
            salePriceDefault={initialProduct?.sale_price ?? "0"}
            currentStockDefault={initialProduct?.current_stock ?? "0"}
            costPriceDefault={defaultCostPrice}
            minStockDefault={defaultMinStock}
            allowInitialStockEdit={allowInitialStockEdit}
            salePriceError={state?.errors?.salePrice?.[0]}
            currentStockError={state?.errors?.currentStock?.[0]}
          />
        </div>

        {/* Paso 3 — Venta rápida (solo en modo avanzado) */}
        {showAdvanced ? (
          <div className={showAllSections || currentStep === 2 ? "" : "hidden"}>
            <ProductQuickSaleSection
              defaultFastRotation={defaultFastRotation}
              defaultPinned={defaultPinned}
            />
          </div>
        ) : null}

        {/* Paso 4 — Configuración del producto (solo en modo avanzado) */}
        {showAdvanced ? (
          <div className={showAllSections || currentStep === 3 ? "" : "hidden"}>
            <ProductConfigSection
              businessType={businessType}
              metadata={metadata}
            />
          </div>
        ) : null}

        {/* Hidden: active siempre se envía como "true" en creación (por defecto) */}
        <input type="hidden" name="active" value={initialProduct?.active !== false ? "true" : "false"} />

        <FormMessage message={state?.errors?.unitType?.[0]} />
        <FormMessage message={state?.errors?.costPrice?.[0]} />
        <FormMessage message={state?.errors?.minStock?.[0]} />
        <FormMessage message={state?.errors?.barcode?.[0]} />
        <FormMessage message={state?.errors?.sku?.[0]} />
        <FormMessage message={state?.errors?.categoryId?.[0]} />
        <FormMessage message={state?.errors?.supplierId?.[0]} />
        <FormMessage message={state?.message} />

        {/* Navegación entre pasos (solo en modo avanzado + creación) */}
        {showAdvanced && !isEditing ? (
          <div className="flex items-center justify-between gap-2">
            <div>
              {currentStep > 0 ? (
                <Button type="button" variant="outline" onClick={handlePrev}>
                  ← Anterior
                </Button>
              ) : null}
            </div>
            <div className="flex gap-2">
              {currentStep < maxSteps - 1 ? (
                <Button type="button" onClick={handleNext}>
                  Siguiente →
                </Button>
              ) : (
                <>
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
                </>
              )}
            </div>
          </div>
        ) : (
          /* Botones originales para modo rápido o edición */
          showAdvanced ? (
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={pending}>
                {pending ? "Guardando..." : submitLabel}
              </Button>
            </div>
          ) : (
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
          )
        )}
      </form>
    </div>
  );
}
